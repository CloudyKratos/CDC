
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Hand, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
}

interface SimpleParticipantGridProps {
  participants: Participant[];
  userRole?: 'speaker' | 'audience' | 'moderator';
  className?: string;
}

export const SimpleParticipantGrid: React.FC<SimpleParticipantGridProps> = ({
  participants,
  userRole,
  className
}) => {
  const speakers = participants.filter(p => p.role === 'speaker' || p.role === 'moderator');
  const audience = participants.filter(p => p.role === 'audience');

  const renderParticipant = (participant: Participant, size: 'large' | 'small' = 'large') => {
    const isLarge = size === 'large';
    
    return (
      <div
        key={participant.id}
        className={cn(
          "relative bg-black/30 rounded-lg border border-white/20 overflow-hidden",
          isLarge ? "aspect-video p-4" : "aspect-square p-2"
        )}
      >
        {/* Video placeholder or avatar */}
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className={isLarge ? "h-16 w-16" : "h-8 w-8"}>
            <AvatarImage src={participant.avatarUrl} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {participant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Participant info overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {participant.role === 'moderator' && (
                <Crown className="h-3 w-3 text-yellow-500 flex-shrink-0" />
              )}
              <span className="text-white text-xs font-medium truncate">
                {participant.name}
              </span>
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {participant.isHandRaised && (
                <Hand className="h-3 w-3 text-orange-500 animate-bounce" />
              )}
              {!participant.isAudioEnabled && (
                <MicOff className="h-3 w-3 text-red-500" />
              )}
            </div>
          </div>
        </div>
        
        {/* Role badge */}
        <div className="absolute top-2 left-2">
          <Badge 
            variant={participant.role === 'moderator' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {participant.role}
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Speakers Section */}
      {speakers.length > 0 && (
        <div className="mb-6">
          <h3 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Speakers ({speakers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {speakers.map(participant => renderParticipant(participant, 'large'))}
          </div>
        </div>
      )}
      
      {/* Audience Section */}
      {audience.length > 0 && (
        <div className="flex-1">
          <h3 className="text-white text-sm font-medium mb-3">
            Audience ({audience.length})
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
            {audience.map(participant => renderParticipant(participant, 'small'))}
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {participants.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white/60">
            <p className="text-lg font-medium">No participants yet</p>
            <p className="text-sm">Waiting for others to join...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleParticipantGrid;
