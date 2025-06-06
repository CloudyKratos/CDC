
import React, { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, Hand, Crown, Volume2 } from 'lucide-react';
import { StageParticipant } from '@/services/core/types/StageTypes';
import { cn } from '@/lib/utils';

interface ParticipantVideoProps {
  participant: StageParticipant;
  stream?: MediaStream;
  isLocal?: boolean;
  isActiveSpeaker?: boolean;
  className?: string;
}

export const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  participant,
  stream,
  isLocal = false,
  isActiveSpeaker = false,
  className
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getRoleIcon = () => {
    switch (participant.role) {
      case 'moderator':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'speaker':
        return <Mic className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden bg-gray-900",
      isActiveSpeaker && "ring-2 ring-blue-400",
      participant.isSpeaking && "ring-2 ring-green-400 animate-pulse",
      className
    )}>
      {/* Video Element */}
      {participant.isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-white text-xl font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <p className="text-white text-sm font-medium">{participant.name}</p>
          </div>
        </div>
      )}

      {/* Status Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Status Bar */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex items-center gap-1 bg-black/60 rounded px-2 py-1">
            {getRoleIcon()}
            <span className="text-white text-xs font-medium">{participant.name}</span>
            {isLocal && <span className="text-blue-400 text-xs">(You)</span>}
          </div>
          
          {participant.isHandRaised && (
            <div className="bg-orange-500 rounded-full p-1 animate-bounce">
              <Hand className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
          <div className="flex items-center gap-1">
            {/* Audio Status */}
            <div className={cn(
              "p-1 rounded",
              participant.isAudioEnabled ? "bg-green-600/80" : "bg-red-600/80"
            )}>
              {participant.isAudioEnabled ? (
                <Mic className="w-3 h-3 text-white" />
              ) : (
                <MicOff className="w-3 h-3 text-white" />
              )}
            </div>

            {/* Video Status */}
            <div className={cn(
              "p-1 rounded",
              participant.isVideoEnabled ? "bg-green-600/80" : "bg-red-600/80"
            )}>
              {participant.isVideoEnabled ? (
                <Video className="w-3 h-3 text-white" />
              ) : (
                <VideoOff className="w-3 h-3 text-white" />
              )}
            </div>
          </div>

          {/* Audio Level Indicator */}
          {participant.isSpeaking && (
            <div className="bg-green-600/80 rounded px-2 py-1 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-white" />
              <div className="flex gap-0.5">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="w-1 h-3 bg-white rounded animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
