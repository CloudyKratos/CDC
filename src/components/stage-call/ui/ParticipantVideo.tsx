
import React from 'react';
import { Mic, MicOff, Video, VideoOff, Hand, Crown, Volume2 } from 'lucide-react';
import { StageParticipant } from '@/services/core/types/StageTypes';
import { cn } from '@/lib/utils';

interface ParticipantVideoProps {
  participant: StageParticipant;
  stream?: MediaStream | null;
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
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getRoleIcon = () => {
    switch (participant.role) {
      case 'moderator':
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'speaker':
        return <Volume2 className="w-3 h-3 text-blue-400" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className={cn(
      "relative bg-gray-900 rounded-lg overflow-hidden border-2 transition-all duration-200",
      isActiveSpeaker && "border-green-400 shadow-lg shadow-green-400/20",
      participant.isSpeaking && "border-blue-400 shadow-lg shadow-blue-400/20",
      !isActiveSpeaker && !participant.isSpeaking && "border-white/10",
      className
    )}>
      {/* Video Element */}
      {participant.isVideoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          muted={isLocal}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {getInitials(participant.name)}
          </div>
        </div>
      )}

      {/* Overlay with participant info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      
      {/* Top indicators */}
      <div className="absolute top-2 left-2 flex items-center gap-1">
        {getRoleIcon()}
        {participant.isHandRaised && (
          <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-pulse">
            <Hand className="w-3 h-3 text-white" />
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {participant.isSpeaking && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
        </div>
      )}

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-white text-sm font-medium truncate max-w-[120px]">
              {participant.name}
              {isLocal && " (You)"}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {participant.isAudioEnabled ? (
              <Mic className="w-4 h-4 text-white" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
            
            {!participant.isVideoEnabled && (
              <VideoOff className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
      </div>

      {/* Local video indicator */}
      {isLocal && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          You
        </div>
      )}
    </div>
  );
};
