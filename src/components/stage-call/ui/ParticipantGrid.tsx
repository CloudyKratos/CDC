
import React from 'react';
import { ParticipantVideo } from './ParticipantVideo';
import { StageParticipant } from '@/services/core/types/StageTypes';
import { cn } from '@/lib/utils';
import { Users, Crown, Volume2 } from 'lucide-react';

interface ParticipantGridProps {
  participants: StageParticipant[];
  localStream?: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
  currentUserId?: string;
  userRole?: 'speaker' | 'audience' | 'moderator';
  onPromoteToSpeaker?: (participantId: string) => void;
  className?: string;
}

export const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  localStream,
  remoteStreams = new Map(),
  currentUserId,
  userRole,
  onPromoteToSpeaker,
  className
}) => {
  // Separate participants by role
  const speakers = participants.filter(p => ['speaker', 'moderator'].includes(p.role));
  const audience = participants.filter(p => p.role === 'audience');
  
  // Add local participant
  const localParticipant: StageParticipant = {
    id: 'local',
    name: 'You',
    role: userRole || 'audience',
    isAudioEnabled: true, // This should come from actual state
    isVideoEnabled: true, // This should come from actual state
    isHandRaised: false,
    isSpeaking: false
  };

  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2';
    if (count <= 6) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  const getAspectRatio = (count: number) => {
    if (count === 1) return 'aspect-video';
    if (count <= 4) return 'aspect-video';
    return 'aspect-square';
  };

  return (
    <div className={cn("flex flex-col h-full gap-4", className)}>
      {/* Speakers Section - Main Stage */}
      {speakers.length > 0 && (
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2 text-white/80 text-sm">
            <Volume2 className="w-4 h-4" />
            <span>Speakers ({speakers.length})</span>
          </div>
          
          <div className={cn(
            "grid gap-3 h-full",
            getGridLayout(speakers.length)
          )}>
            {speakers.map(participant => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                stream={remoteStreams.get(participant.id)}
                isActiveSpeaker={participant.isSpeaking}
                className={getAspectRatio(speakers.length)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Local User + Audience Section */}
      <div className="h-48 border-t border-white/10 pt-4">
        <div className="mb-2 flex items-center gap-2 text-white/80 text-sm">
          <Users className="w-4 h-4" />
          <span>Participants ({audience.length + 1})</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 h-full">
          {/* Local Video */}
          <ParticipantVideo
            participant={localParticipant}
            stream={localStream}
            isLocal={true}
            className="aspect-video"
          />

          {/* Audience Members */}
          {audience.map(participant => (
            <div key={participant.id} className="relative group">
              <ParticipantVideo
                participant={participant}
                stream={remoteStreams.get(participant.id)}
                className="aspect-video"
              />
              
              {/* Promote to Speaker Button (for moderators) */}
              {userRole === 'moderator' && onPromoteToSpeaker && (
                <button
                  onClick={() => onPromoteToSpeaker(participant.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs flex items-center gap-1"
                >
                  <Crown className="w-3 h-3" />
                  Promote
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {participants.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-white/60">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Welcome to the Stage!</h3>
            <p>You're the first one here. Others will join soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};
