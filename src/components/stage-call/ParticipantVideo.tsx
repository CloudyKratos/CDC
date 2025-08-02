import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, Hand, Crown, Volume2, Wifi, WifiOff, Signal } from 'lucide-react';
import { ConferenceParticipant } from '@/services/conference/VideoConferenceService';
import { cn } from '@/lib/utils';

interface ParticipantVideoProps {
  participant: ConferenceParticipant;
  isLocal?: boolean;
  isActiveSpeaker?: boolean;
  className?: string;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  isLocal = false,
  isActiveSpeaker = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      try {
        videoRef.current.srcObject = participant.stream;
        const videoTracks = participant.stream.getVideoTracks();
        setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);
      } catch (error) {
        console.warn('Failed to set video source:', error);
        setHasVideo(false);
      }
    } else {
      setHasVideo(false);
    }
  }, [participant.stream, participant.isVideoEnabled]);

  // Update audio level for visual feedback
  useEffect(() => {
    if (participant.audioLevel !== undefined) {
      setAudioLevel(participant.audioLevel);
    }
  }, [participant.audioLevel]);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getConnectionColor = () => {
    switch (participant.connectionState) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-red-400';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getConnectionIcon = () => {
    switch (participant.connectionState) {
      case 'connected': return <Wifi className="w-3 h-3" />;
      case 'connecting': return <Signal className="w-3 h-3 animate-pulse" />;
      default: return <WifiOff className="w-3 h-3" />;
    }
  };

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gray-900 border-2 transition-all duration-300",
      isActiveSpeaker && "border-blue-500 shadow-xl shadow-blue-500/30 ring-4 ring-blue-500/30 scale-105",
      participant.isSpeaking && !isActiveSpeaker && "border-green-400 shadow-lg shadow-green-400/20 ring-2 ring-green-400/20",
      !isActiveSpeaker && !participant.isSpeaking && "border-gray-700 hover:border-gray-600",
      className
    )}>
      {/* Video or Avatar */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900">
        {participant.isVideoEnabled && hasVideo && participant.stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
            onLoadedMetadata={() => {
              console.log(`📹 Video loaded for ${participant.name}`);
            }}
            onError={(e) => {
              console.warn(`❌ Video error for ${participant.name}:`, e);
              setHasVideo(false);
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className={cn(
              "w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold text-2xl transition-all duration-300",
              participant.isSpeaking ? "bg-blue-600 scale-110" : "bg-gray-600"
            )}>
              {getInitials(participant.name)}
            </div>
          </div>
        )}

        {/* Speaking indicator animation */}
        {participant.isSpeaking && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 via-blue-400/20 to-green-400/20 animate-pulse" />
        )}

        {/* Audio level visualization */}
        {participant.isSpeaking && audioLevel > 0 && (
          <div className="absolute bottom-16 left-2 right-2">
            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-150 ease-out"
                style={{ width: `${Math.min(audioLevel * 2, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

        {/* Top indicators */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {/* Connection status */}
          <div className={cn("flex items-center gap-1 p-1.5 rounded-full bg-black/50", getConnectionColor())}>
            {getConnectionIcon()}
          </div>

          {/* Hand raised */}
          {participant.isHandRaised && (
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <Hand className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Local indicator */}
          {isLocal && (
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-blue-600/90 text-white border-blue-400/50">
              You
            </Badge>
          )}
        </div>

        {/* Top right indicators */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {/* Active speaker crown */}
          {isActiveSpeaker && (
            <div className="p-1.5 bg-yellow-500/90 rounded-full shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Speaking indicator */}
          {participant.isSpeaking && (
            <div className="flex items-center gap-1 p-1.5 bg-green-500/90 rounded-full shadow-lg">
              <Volume2 className="w-3 h-3 text-white" />
              <div className="flex gap-0.5">
                <div className="w-1 h-2 bg-white rounded-full animate-pulse" />
                <div className="w-1 h-3 bg-white rounded-full animate-pulse delay-100" />
                <div className="w-1 h-2 bg-white rounded-full animate-pulse delay-200" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom participant info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <span className="text-white text-sm font-semibold truncate">
                {participant.name}
              </span>
              
              {/* Connection quality and join time */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-white/60">
                  {participant.joinedAt.toLocaleTimeString()}
                </span>
                <div className={cn("flex items-center gap-1", getConnectionColor())}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span className="capitalize">{participant.connectionState}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Audio indicator */}
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                participant.isAudioEnabled 
                  ? "bg-green-600/90 text-white shadow-md" 
                  : "bg-red-600/90 text-white shadow-md"
              )}>
                {participant.isAudioEnabled ? (
                  <Mic className="w-3 h-3" />
                ) : (
                  <MicOff className="w-3 h-3" />
                )}
              </div>

              {/* Video indicator */}
              <div className={cn(
                "p-2 rounded-lg transition-all duration-200",
                participant.isVideoEnabled 
                  ? "bg-green-600/90 text-white shadow-md" 
                  : "bg-red-600/90 text-white shadow-md"
              )}>
                {participant.isVideoEnabled ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <VideoOff className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ParticipantVideo;