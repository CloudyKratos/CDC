import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Play, Pause, Download, Trash2, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VoiceMessage {
  id: string;
  url: string;
  duration: number;
  waveform?: number[];
  transcript?: string;
  createdAt: string;
}

interface VoiceMessageRecorderProps {
  onSendVoiceMessage: (audioBlob: Blob, duration: number) => Promise<boolean>;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  className?: string;
}

interface VoiceMessagePlayerProps {
  voiceMessage: VoiceMessage;
  onDelete?: (messageId: string) => void;
  className?: string;
}

// Voice Message Recorder Component
export const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSendVoiceMessage,
  isRecording,
  onStartRecording,
  onStopRecording,
  className = ''
}) => {
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up audio visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await onSendVoiceMessage(audioBlob, recordingDuration);
        stream.getTracks().forEach(track => track.stop());
        if (audioContext) audioContext.close();
      };

      mediaRecorder.start();
      onStartRecording();

      // Start duration timer and audio level monitoring
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
        
        if (analyser) {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average / 255 * 100);
        }
      }, 100);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onStopRecording();
    setRecordingDuration(0);
    setAudioLevel(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!isRecording ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={startRecording}
              className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
            >
              <Mic size={14} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Record voice message</TooltipContent>
        </Tooltip>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-full px-4 py-2"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <div className="w-2 h-2 bg-destructive rounded-full" />
          </motion.div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-destructive">
              {formatDuration(recordingDuration)}
            </span>
            
            <div className="w-16 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-destructive rounded-full"
                style={{ width: `${audioLevel}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={stopRecording}
            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/20"
          >
            <MicOff size={12} />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

// Voice Message Player Component
export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  voiceMessage,
  onDelete,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(voiceMessage.url);
    audioRef.current = audio;

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [voiceMessage.url]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.playbackRate = playbackRate;
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (percentage: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (percentage / 100) * voiceMessage.duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    setPlaybackRate(nextRate);

    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const downloadVoiceMessage = () => {
    const a = document.createElement('a');
    a.href = voiceMessage.url;
    a.download = `voice-message-${voiceMessage.id}.webm`;
    a.click();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = voiceMessage.duration > 0 ? (currentTime / voiceMessage.duration) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 bg-secondary/30 rounded-lg p-3 max-w-xs ${className}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayback}
        className="h-8 w-8 p-0 rounded-full bg-primary/10 hover:bg-primary/20"
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </Button>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Volume2 size={12} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {formatDuration(currentTime)} / {formatDuration(voiceMessage.duration)}
          </span>
          <Badge 
            variant="outline" 
            className="text-xs cursor-pointer hover:bg-secondary"
            onClick={togglePlaybackRate}
          >
            {playbackRate}x
          </Badge>
        </div>

        <div className="relative">
          <Progress 
            value={progress} 
            className="h-1 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = ((e.clientX - rect.left) / rect.width) * 100;
              handleSeek(percentage);
            }}
          />
          
          {voiceMessage.waveform && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-px h-1">
                {voiceMessage.waveform.slice(0, 20).map((amplitude, index) => (
                  <div
                    key={index}
                    className="bg-primary/30 min-w-px"
                    style={{ 
                      height: `${Math.max(amplitude * 100, 10)}%`,
                      opacity: (index / 20) * progress / 100 > index / 20 ? 1 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadVoiceMessage}
              className="h-6 w-6 p-0"
            >
              <Download size={10} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download</TooltipContent>
        </Tooltip>

        {onDelete && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(voiceMessage.id)}
                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={10} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
      </div>
    </motion.div>
  );
};