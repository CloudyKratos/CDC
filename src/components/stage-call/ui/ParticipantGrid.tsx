
import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, Crown, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  stream?: MediaStream;
}

interface ParticipantGridProps {
  participants: Participant[];
  localStream?: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
  userRole: 'speaker' | 'audience' | 'moderator';
  onPromoteToSpeaker?: (participantId: string) => void;
  className?: string;
}

const ParticipantCard: React.FC<{
  participant: Participant;
  stream?: MediaStream;
  isLocal?: boolean;
  userRole: string;
  onPromoteToSpeaker?: (id: string) => void;
}> = ({ participant, stream, isLocal = false, userRole, onPromoteToSpeaker }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Add safety checks for participant data
  if (!participant) {
    return null;
  }

  const participantName = participant.name || 'Unknown';
  const participantId = participant.id || '';

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

  const getRoleBadgeColor = () => {
    switch (participant.role) {
      case 'moderator':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'speaker':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <Card className="relative aspect-video bg-gray-900 border-gray-700 overflow-hidden group">
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
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-xl font-semibold text-white">
              {participantName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      )}

      {/* Overlay with participant info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
        {/* Top badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {isLocal && (
            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
              You
            </Badge>
          )}
          <Badge variant="outline" className={cn("text-xs", getRoleBadgeColor())}>
            <div className="flex items-center gap-1">
              {getRoleIcon()}
              {participant.role}
            </div>
          </Badge>
        </div>

        {/* Audio/Video indicators */}
        <div className="absolute top-2 right-2 flex gap-1">
          {participant.isAudioEnabled ? (
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <Mic className="w-3 h-3 text-green-400" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <MicOff className="w-3 h-3 text-red-400" />
            </div>
          )}
          
          {participant.isVideoEnabled ? (
            <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <Video className="w-3 h-3 text-green-400" />
            </div>
          ) : (
            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <VideoOff className="w-3 h-3 text-red-400" />
            </div>
          )}
        </div>

        {/* Bottom name */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-sm font-medium truncate">{participantName}</p>
        </div>

        {/* Hand raised indicator */}
        {participant.role === 'audience' && (
          <div className="absolute bottom-2 right-2">
            <Hand className="w-4 h-4 text-yellow-400 animate-bounce" />
          </div>
        )}

        {/* Moderator actions */}
        {userRole === 'moderator' && participant.role === 'audience' && onPromoteToSpeaker && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={() => onPromoteToSpeaker(participantId)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              Promote to Speaker
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  localStream,
  remoteStreams = new Map(),
  userRole,
  onPromoteToSpeaker,
  className
}) => {
  // Filter participants by role for better layout and add safety checks
  const validParticipants = participants.filter(p => p && p.id && p.name);
  const speakers = validParticipants.filter(p => ['speaker', 'moderator'].includes(p.role));
  const audience = validParticipants.filter(p => p.role === 'audience');

  // Create a local participant entry
  const localParticipant: Participant = {
    id: 'local',
    name: 'You',
    role: userRole,
    isAudioEnabled: localStream?.getAudioTracks()[0]?.enabled ?? false,
    isVideoEnabled: localStream?.getVideoTracks()[0]?.enabled ?? false,
  };

  return (
    <div className={cn("w-full h-full flex flex-col gap-4", className)}>
      {/* Speakers/Moderators Section */}
      {(speakers.length > 0 || userRole !== 'audience') && (
        <div className="flex-1">
          <h3 className="text-white/80 text-sm font-medium mb-2">Speakers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local participant if speaker/moderator */}
            {userRole !== 'audience' && (
              <ParticipantCard
                participant={localParticipant}
                stream={localStream || undefined}
                isLocal={true}
                userRole={userRole}
              />
            )}
            
            {/* Remote speakers */}
            {speakers.map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                stream={remoteStreams.get(participant.id)}
                userRole={userRole}
                onPromoteToSpeaker={onPromoteToSpeaker}
              />
            ))}
          </div>
        </div>
      )}

      {/* Audience Section */}
      {audience.length > 0 && (
        <div className="max-h-48 overflow-y-auto">
          <h3 className="text-white/80 text-sm font-medium mb-2">
            Audience ({audience.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {/* Local participant if audience */}
            {userRole === 'audience' && (
              <ParticipantCard
                participant={localParticipant}
                stream={localStream || undefined}
                isLocal={true}
                userRole={userRole}
              />
            )}
            
            {/* Remote audience */}
            {audience.map(participant => (
              <ParticipantCard
                key={participant.id}
                participant={participant}
                stream={remoteStreams.get(participant.id)}
                userRole={userRole}
                onPromoteToSpeaker={onPromoteToSpeaker}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
