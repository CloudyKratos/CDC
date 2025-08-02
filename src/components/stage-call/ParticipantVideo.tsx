
import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, Hand, Crown, Volume2, Wifi, WifiOff } from 'lucide-react';
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

  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      setHasVideo(participant.stream.getVideoTracks().length > 0);
    } else {
      setHasVideo(false);
    }
  }, [participant.stream]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
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

  return (
    <Card className={cn(
      "relative overflow-hidden bg-gray-900 border-2 transition-all duration-200",
      isActiveSpeaker && "border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/20",
      participant.isSpeaking && !isActiveSpeaker && "border-green-400 shadow-md shadow-green-400/10",
      !isActiveSpeaker && !participant.isSpeaking && "border-gray-700",
      className
    )}>
      {/* Video or Avatar */}
      <div className="relative aspect-video w-full">
        {participant.isVideoEnabled && hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {getInitials(participant.name)}
            </div>
          </div>
        )}

        {/* Speaking indicator animation */}
        {participant.isSpeaking && (
          <div className="absolute inset-0 bg-green-400/10 animate-pulse" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          {/* Connection status */}
          <div className={cn("flex items-center gap-1", getConnectionColor())}>
            {participant.connectionState === 'connected' ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
          </div>

          {/* Hand raised */}
          {participant.isHandRaised && (
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce">
              <Hand className="w-3 h-3 text-white" />
            </div>
          )}

          {/* Local indicator */}
          {isLocal && (
            <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-600/80 text-white">
              You
            </Badge>
          )}
        </div>

        {/* Top right indicators */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {/* Speaking indicator */}
          {participant.isSpeaking && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <Volume2 className="w-3 h-3 text-green-400" />
            </div>
          )}

          {/* Active speaker crown */}
          {isActiveSpeaker && (
            <Crown className="w-4 h-4 text-yellow-400" />
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-white text-sm font-medium truncate">
                {participant.name}
              </span>
              
              {/* Join time for debugging */}
              <span className="text-white/50 text-xs">
                {participant.joinedAt.toLocaleTimeString()}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {/* Audio indicator */}
              {participant.isAudioEnabled ? (
                <div className="p-1 bg-green-600/80 rounded">
                  <Mic className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="p-1 bg-red-600/80 rounded">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Video indicator */}
              {participant.isVideoEnabled ? (
                <div className="p-1 bg-green-600/80 rounded">
                  <Video className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="p-1 bg-red-600/80 rounded">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection quality indicator */}
        <div className="absolute bottom-2 right-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            participant.connectionState === 'connected' ? 'bg-green-400' : 'bg-red-400'
          )} />
        </div>
      </div>
    </Card>
  );
};

export default ParticipantVideo;
