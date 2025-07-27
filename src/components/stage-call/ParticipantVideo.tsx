
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  Crown, 
  Shield,
  VolumeX,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ParticipantVideoProps {
  userId: string;
  name: string;
  role: 'moderator' | 'speaker' | 'audience';
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised?: boolean;
  isSpeaking?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  isLocal?: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onPromoteToSpeaker?: () => void;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({
  userId,
  name,
  role,
  stream,
  isAudioEnabled,
  isVideoEnabled,
  isHandRaised = false,
  isSpeaking = false,
  connectionQuality = 'good',
  isLocal = false,
  isMuted = false,
  onToggleMute,
  onPromoteToSpeaker
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const getRoleIcon = () => {
    switch (role) {
      case 'moderator':
        return <Crown className="w-3 h-3" />;
      case 'speaker':
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'moderator':
        return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30';
      case 'speaker':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const getConnectionColor = () => {
    switch (connectionQuality) {
      case 'excellent':
        return 'border-green-500/50';
      case 'good':
        return 'border-blue-500/50';
      case 'fair':
        return 'border-yellow-500/50';
      case 'poor':
        return 'border-red-500/50';
      default:
        return 'border-border/50';
    }
  };

  return (
    <Card className={`
      relative aspect-video overflow-hidden group transition-all duration-300 hover:shadow-lg
      ${isSpeaking ? 'ring-2 ring-primary ring-offset-2' : ''}
      ${getConnectionColor()}
    `}>
      <div className="absolute inset-0">
        {isVideoEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || isMuted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted/20 to-muted/10 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">Camera off</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="outline" className={`text-xs ${getRoleColor()}`}>
            {getRoleIcon()}
            <span className="ml-1 capitalize">{isLocal ? 'You' : name}</span>
          </Badge>
        </div>

        {/* Audio/Video indicators */}
        <div className="absolute top-3 right-3 flex gap-1">
          {isAudioEnabled ? (
            <div className={`w-7 h-7 bg-green-500/90 rounded-full flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
              <Mic className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          
          {isMuted && (
            <div className="w-7 h-7 bg-orange-500/90 rounded-full flex items-center justify-center">
              <VolumeX className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Raised hand */}
        {isHandRaised && (
          <div className="absolute bottom-3 right-3">
            <div className="w-8 h-8 bg-yellow-500/90 rounded-full flex items-center justify-center">
              <Hand className="w-4 h-4 text-white animate-bounce" />
            </div>
          </div>
        )}

        {/* Control buttons for moderators */}
        {!isLocal && (onToggleMute || onPromoteToSpeaker) && (
          <div className="absolute bottom-3 left-3 flex gap-2">
            {onToggleMute && (
              <Button
                size="sm"
                variant="outline"
                onClick={onToggleMute}
                className="w-8 h-8 p-0 bg-black/50 border-white/20 hover:bg-black/70"
              >
                {isMuted ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </Button>
            )}
            
            {onPromoteToSpeaker && role === 'audience' && (
              <Button
                size="sm"
                variant="outline"
                onClick={onPromoteToSpeaker}
                className="w-8 h-8 p-0 bg-black/50 border-white/20 hover:bg-black/70"
              >
                <Shield className="w-3 h-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Connection quality indicator */}
      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className={`w-2 h-2 rounded-full ${
          connectionQuality === 'excellent' ? 'bg-green-500' :
          connectionQuality === 'good' ? 'bg-blue-500' :
          connectionQuality === 'fair' ? 'bg-yellow-500' :
          'bg-red-500'
        }`} />
      </div>
    </Card>
  );
};

export default ParticipantVideo;
