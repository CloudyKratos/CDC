
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  Crown, 
  VolumeX,
  Volume2,
  Pin,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StageVideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Array<{
    id: string;
    name: string;
    role: 'host' | 'speaker' | 'audience';
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
    isSpeaking?: boolean;
    isHandRaised?: boolean;
  }>;
  localParticipant: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  };
  currentUserId: string;
  isHost?: boolean;
  onMuteParticipant?: (userId: string) => void;
  onRemoveParticipant?: (userId: string) => void;
  onPromoteToSpeaker?: (userId: string) => void;
  onPinParticipant?: (userId: string) => void;
}

const StageVideoGrid: React.FC<StageVideoGridProps> = ({
  localStream,
  remoteStreams,
  participants,
  localParticipant,
  currentUserId,
  isHost = false,
  onMuteParticipant,
  onRemoveParticipant,
  onPromoteToSpeaker,
  onPinParticipant
}) => {
  const [pinnedParticipant, setPinnedParticipant] = React.useState<string | null>(null);
  const [mutedParticipants, setMutedParticipants] = React.useState<Set<string>>(new Set());

  const VideoTile = ({ 
    stream, 
    participant,
    isLocal = false,
    isPinned = false,
    className = ""
  }: {
    stream: MediaStream | null;
    participant: {
      id: string;
      name: string;
      role: 'host' | 'speaker' | 'audience';
      isAudioEnabled: boolean;
      isVideoEnabled: boolean;
      isSpeaking?: boolean;
      isHandRaised?: boolean;
    } | null;
    isLocal?: boolean;
    isPinned?: boolean;
    className?: string;
  }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isLocalMuted, setIsLocalMuted] = React.useState(false);

    React.useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    const displayName = isLocal ? 'You' : (participant?.name || 'Unknown');
    const isVideoEnabled = isLocal ? localParticipant.isVideoEnabled : (participant?.isVideoEnabled ?? false);
    const isAudioEnabled = isLocal ? localParticipant.isAudioEnabled : (participant?.isAudioEnabled ?? false);
    const isMuted = mutedParticipants.has(participant?.id || '');

    const handleLocalMute = () => {
      if (participant && !isLocal) {
        setIsLocalMuted(!isLocalMuted);
        if (videoRef.current) {
          videoRef.current.muted = !isLocalMuted;
        }
      }
    };

    const getRoleIcon = (role: string) => {
      switch (role) {
        case 'host':
          return <Crown className="w-3 h-3 text-yellow-400" />;
        case 'speaker':
          return <Mic className="w-3 h-3 text-green-400" />;
        default:
          return null;
      }
    };

    const getRoleBadgeColor = (role: string) => {
      switch (role) {
        case 'host':
          return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
        case 'speaker':
          return 'bg-green-500/20 text-green-300 border-green-500/30';
        default:
          return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      }
    };

    return (
      <Card className={`relative aspect-video bg-gray-800 border-gray-700 overflow-hidden group transition-all duration-200 ${
        isPinned ? 'ring-2 ring-blue-500' : ''
      } ${
        participant?.isSpeaking ? 'ring-2 ring-green-500' : ''
      } ${className}`}>
        {isVideoEnabled && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal || isLocalMuted}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-xl font-semibold text-white">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Top controls */}
          <div className="absolute top-2 left-2 right-2 flex justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${getRoleBadgeColor(participant?.role || 'audience')}`}>
                <span className="flex items-center gap-1">
                  {getRoleIcon(participant?.role || 'audience')}
                  {displayName}
                </span>
              </Badge>
              
              {participant?.isHandRaised && (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                  ✋ Hand raised
                </Badge>
              )}
            </div>
            
            {/* Host controls */}
            {isHost && !isLocal && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onPinParticipant?.(participant?.id || '')}>
                    <Pin className="w-4 h-4 mr-2" />
                    {isPinned ? 'Unpin' : 'Pin'} participant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMuteParticipant?.(participant?.id || '')}>
                    <MicOff className="w-4 h-4 mr-2" />
                    {isMuted ? 'Unmute' : 'Mute'} participant
                  </DropdownMenuItem>
                  {participant?.role === 'audience' && (
                    <DropdownMenuItem onClick={() => onPromoteToSpeaker?.(participant?.id || '')}>
                      <Mic className="w-4 h-4 mr-2" />
                      Promote to speaker
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onRemoveParticipant?.(participant?.id || '')}
                    className="text-red-400"
                  >
                    Remove from stage
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Bottom controls */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
            <div className="flex gap-1">
              {isAudioEnabled ? (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  participant?.isSpeaking ? 'bg-green-500/40 animate-pulse' : 'bg-green-500/20'
                }`}>
                  <Mic className="w-3 h-3 text-green-400" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <MicOff className="w-3 h-3 text-red-400" />
                </div>
              )}
              
              {!isVideoEnabled && (
                <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                  <VideoOff className="w-3 h-3 text-red-400" />
                </div>
              )}
            </div>

            {/* Local audio control for remote participants */}
            {!isLocal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLocalMute}
                className="opacity-0 group-hover:opacity-100"
              >
                {isLocalMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-white" />
                )}
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  // Separate pinned participant
  const pinnedParticipantData = participants.find(p => p.id === pinnedParticipant);
  const unpinnedParticipants = participants.filter(p => p.id !== pinnedParticipant);

  return (
    <div className="p-6 h-full flex flex-col gap-4">
      {/* Pinned participant (large view) */}
      {pinnedParticipant && pinnedParticipantData && (
        <div className="h-2/3">
          <VideoTile 
            stream={pinnedParticipant === currentUserId ? localStream : remoteStreams.get(pinnedParticipant) || null}
            participant={pinnedParticipantData}
            isLocal={pinnedParticipant === currentUserId}
            isPinned={true}
            className="h-full"
          />
        </div>
      )}

      {/* Grid of other participants */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${
        pinnedParticipant ? 'h-1/3' : 'h-full'
      }`}>
        {/* Local video (if not pinned) */}
        {pinnedParticipant !== currentUserId && (
          <VideoTile 
            stream={localStream}
            participant={{
              id: currentUserId,
              name: 'You',
              role: 'speaker',
              isAudioEnabled: localParticipant.isAudioEnabled,
              isVideoEnabled: localParticipant.isVideoEnabled
            }}
            isLocal={true}
          />
        )}

        {/* Remote participants (excluding pinned) */}
        {unpinnedParticipants
          .filter(p => p.id !== currentUserId)
          .map((participant) => (
            <VideoTile 
              key={participant.id}
              stream={remoteStreams.get(participant.id) || null}
              participant={participant}
            />
          ))}

        {/* Empty state when no participants */}
        {participants.length === 0 && !pinnedParticipant && (
          <div className="col-span-full flex items-center justify-center text-white/40 text-center">
            <div>
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Waiting for others to join...</p>
              <p className="text-sm">Share the stage link to invite participants</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StageVideoGrid;
