
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  role: string;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  avatarUrl?: string;
  stream?: MediaStream;
  connectionState?: RTCPeerConnectionState;
}

interface ParticipantGridProps {
  participants: Participant[];
  localStream: MediaStream | null;
  userRole: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const ParticipantGrid: React.FC<ParticipantGridProps> = ({
  participants,
  localStream,
  userRole,
  isVideoEnabled,
  isAudioEnabled
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Set up local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const RemoteParticipantVideo: React.FC<{ participant: Participant }> = ({ participant }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
      if (videoRef.current && participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
    }, [participant.stream]);

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
    );
  };

  const renderParticipantTile = (participant: Participant, isLocal = false) => (
    <div
      key={participant.id}
      className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-white/10"
    >
      {/* Video/Avatar Display */}
      <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
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
          <Avatar className="w-16 h-16">
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
            {participant.role === 'speaker' && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                Speaker
              </span>
            )}
            {participant.connectionState && !isLocal && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                participant.connectionState === 'connected' ? 'bg-green-500/20 text-green-400' :
                participant.connectionState === 'connecting' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {participant.connectionState}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {(participant.isAudioEnabled && !isLocal) || (isLocal && isAudioEnabled) ? (
              <Mic className="h-4 w-4 text-green-400" />
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
      {(participant.isAudioEnabled && !isLocal) || (isLocal && isAudioEnabled) && (
        <div className="absolute inset-0 border-2 border-green-400 rounded-xl animate-pulse pointer-events-none" />
      )}

      {/* Connection Quality Indicator */}
      {!isLocal && participant.connectionState && (
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full ${
            participant.connectionState === 'connected' ? 'bg-green-400' :
            participant.connectionState === 'connecting' ? 'bg-yellow-400 animate-pulse' :
            'bg-red-400'
          }`}></div>
        </div>
      )}
    </div>
  );

  const allParticipants = [
    {
      id: 'local',
      name: 'You',
      role: userRole,
      isAudioEnabled,
      isVideoEnabled,
      avatarUrl: undefined
    },
    ...participants
  ];

  const getGridColumns = (count: number) => {
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className={`grid gap-4 h-full ${getGridColumns(allParticipants.length)}`}>
        {allParticipants.map((participant, index) => 
          renderParticipantTile(participant, index === 0)
        )}
      </div>
      
      {/* Debug info */}
      {participants.length > 0 && (
        <div className="absolute bottom-20 left-4 text-xs text-white/50">
          Remote participants: {participants.length}
        </div>
      )}
    </div>
  );
};
