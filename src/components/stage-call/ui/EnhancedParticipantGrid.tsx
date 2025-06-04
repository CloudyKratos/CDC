
import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  Crown, 
  UserMinus,
  Volume2,
  VolumeX,
  Maximize2,
  Pin
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedParticipant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  avatarUrl?: string;
  stream?: MediaStream;
  connectionState?: RTCPeerConnectionState;
  audioLevel?: number;
  isPinned?: boolean;
  isScreenSharing?: boolean;
}

interface EnhancedParticipantGridProps {
  participants: EnhancedParticipant[];
  localStream: MediaStream | null;
  currentUser: {
    id: string;
    name: string;
    role: 'speaker' | 'audience' | 'moderator';
  };
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking?: boolean;
  onMuteParticipant?: (participantId: string) => void;
  onRemoveParticipant?: (participantId: string) => void;
  onPromoteToSpeaker?: (participantId: string) => void;
  onPinParticipant?: (participantId: string) => void;
  layout?: 'grid' | 'speaker-focus' | 'presentation';
}

export const EnhancedParticipantGrid: React.FC<EnhancedParticipantGridProps> = ({
  participants,
  localStream,
  currentUser,
  isVideoEnabled,
  isAudioEnabled,
  isSpeaking = false,
  onMuteParticipant,
  onRemoveParticipant,
  onPromoteToSpeaker,
  onPinParticipant,
  layout = 'grid'
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [fullscreenParticipant, setFullscreenParticipant] = useState<string | null>(null);

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const RemoteParticipantVideo: React.FC<{ participant: EnhancedParticipant }> = ({ participant }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      if (videoRef.current && participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
    }, [participant.stream]);

    return (
      <div 
        className="relative w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Participant Controls Overlay */}
        {isHovered && currentUser.role === 'moderator' && (
          <div className="absolute top-2 right-2 flex gap-1">
            {onMuteParticipant && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onMuteParticipant(participant.id)}
              >
                {participant.isAudioEnabled ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}
            
            {onPromoteToSpeaker && participant.role === 'audience' && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onPromoteToSpeaker(participant.id)}
              >
                <Crown className="h-4 w-4" />
              </Button>
            )}
            
            {onPinParticipant && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
                onClick={() => onPinParticipant(participant.id)}
              >
                <Pin className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setFullscreenParticipant(participant.id)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            
            {onRemoveParticipant && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-red-500/50 text-white hover:bg-red-500/70"
                onClick={() => onRemoveParticipant(participant.id)}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderParticipantTile = (participant: EnhancedParticipant, isLocal = false, size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizeClasses = {
      small: 'aspect-video',
      medium: 'aspect-video',
      large: 'aspect-video h-full'
    };

    return (
      <div
        key={participant.id}
        className={cn(
          "relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10",
          sizeClasses[size],
          participant.isSpeaking && "ring-2 ring-green-400 ring-opacity-75",
          participant.isPinned && "ring-2 ring-blue-400 ring-opacity-75",
          participant.isScreenSharing && "ring-2 ring-purple-400 ring-opacity-75"
        )}
      >
        {/* Video/Avatar Display */}
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          {participant.isVideoEnabled || (isLocal && isVideoEnabled) ? (
            isLocal ? (
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <RemoteParticipantVideo participant={participant} />
            )
          ) : (
            <Avatar className={cn(
              size === 'large' ? 'w-24 h-24' : size === 'medium' ? 'w-16 h-16' : 'w-12 h-12'
            )}>
              <AvatarImage src={participant.avatarUrl} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-lg">
                {participant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Participant Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate">
                {participant.name} {isLocal && '(You)'}
              </span>
              
              {/* Role Badge */}
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                participant.role === 'speaker' && "bg-purple-500 text-white",
                participant.role === 'moderator' && "bg-gold-500 text-white",
                participant.role === 'audience' && "bg-gray-500 text-white"
              )}>
                {participant.role === 'moderator' && <Crown className="h-3 w-3 mr-1 inline" />}
                {participant.role}
              </span>

              {/* Hand Raised Indicator */}
              {participant.isHandRaised && (
                <Hand className="h-4 w-4 text-yellow-400 animate-bounce" />
              )}

              {/* Connection State */}
              {participant.connectionState && !isLocal && (
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  participant.connectionState === 'connected' ? 'bg-green-500/20 text-green-400' :
                  participant.connectionState === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                )}>
                  {participant.connectionState}
                </span>
              )}
            </div>
            
            {/* Audio/Video Status */}
            <div className="flex items-center gap-1">
              {(participant.isAudioEnabled && !isLocal) || (isLocal && isAudioEnabled) ? (
                <div className="flex items-center">
                  <Mic className="h-4 w-4 text-green-400" />
                  {participant.audioLevel && (
                    <div className="w-8 h-1 bg-gray-600 rounded-full ml-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-400 transition-all duration-150"
                        style={{ width: `${participant.audioLevel * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <MicOff className="h-4 w-4 text-red-400" />
              )}
              
              {!(participant.isVideoEnabled || (isLocal && isVideoEnabled)) && (
                <VideoOff className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>
        </div>

        {/* Speaking Indicator */}
        {(participant.isSpeaking && !isLocal) || (isLocal && isSpeaking) && (
          <div className="absolute inset-0 border-2 border-green-400 rounded-xl animate-pulse pointer-events-none" />
        )}

        {/* Pinned Indicator */}
        {participant.isPinned && (
          <div className="absolute top-2 left-2">
            <Pin className="h-4 w-4 text-blue-400" />
          </div>
        )}

        {/* Screen Sharing Indicator */}
        {participant.isScreenSharing && (
          <div className="absolute top-2 left-2 bg-purple-500 px-2 py-1 rounded text-white text-xs">
            Screen
          </div>
        )}
      </div>
    );
  };

  const allParticipants: EnhancedParticipant[] = [
    {
      id: 'local',
      name: currentUser.name,
      role: currentUser.role,
      isAudioEnabled,
      isVideoEnabled,
      isHandRaised: false,
      isSpeaking,
      avatarUrl: undefined
    },
    ...participants
  ];

  const getGridLayout = () => {
    const count = allParticipants.length;
    
    if (layout === 'speaker-focus') {
      const speakers = allParticipants.filter(p => p.role === 'speaker' || p.isPinned);
      const others = allParticipants.filter(p => p.role !== 'speaker' && !p.isPinned);
      
      return (
        <div className="flex h-full gap-4">
          {/* Main speaker area */}
          <div className="flex-1">
            {speakers.length > 0 && renderParticipantTile(speakers[0], speakers[0].id === 'local', 'large')}
          </div>
          
          {/* Side panel for other participants */}
          {others.length > 0 && (
            <div className="w-64 space-y-2 overflow-auto">
              {others.map((participant, index) => 
                renderParticipantTile(participant, participant.id === 'local', 'small')
              )}
            </div>
          )}
        </div>
      );
    }

    // Default grid layout
    const getGridColumns = (count: number) => {
      if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
      if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
      if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
      if (count <= 9) return 'grid-cols-3 md:grid-cols-3';
      return 'grid-cols-3 md:grid-cols-4';
    };

    return (
      <div className={cn('grid gap-4 h-full', getGridColumns(count))}>
        {allParticipants.map((participant, index) => 
          renderParticipantTile(participant, index === 0)
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      {getGridLayout()}
      
      {/* Debug info */}
      {participants.length > 0 && (
        <div className="absolute bottom-20 left-4 text-xs text-white/50 space-y-1">
          <div>Layout: {layout}</div>
          <div>Remote participants: {participants.length}</div>
          <div>Total participants: {allParticipants.length}</div>
          {pinnedParticipant && <div>Pinned: {pinnedParticipant}</div>}
        </div>
      )}
    </div>
  );
};
