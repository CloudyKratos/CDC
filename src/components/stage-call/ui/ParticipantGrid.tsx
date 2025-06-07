
import React from 'react';
import { SimpleParticipantGrid } from './SimpleParticipantGrid';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
}

interface ParticipantGridProps {
  participants: Participant[];
  localStream?: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
  userRole?: 'speaker' | 'audience' | 'moderator';
  onPromoteToSpeaker?: (participantId: string) => void;
  className?: string;
}

export const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  userRole,
  className
}) => {
  return (
    <SimpleParticipantGrid
      participants={participants}
      userRole={userRole}
      className={className}
    />
  );
};

export default ParticipantGrid;
