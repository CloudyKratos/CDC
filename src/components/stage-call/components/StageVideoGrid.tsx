
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Video, VideoOff, Users } from 'lucide-react';

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
  }>;
  localParticipant: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  };
}

const StageVideoGrid: React.FC<StageVideoGridProps> = ({
  localStream,
  remoteStreams,
  participants,
  localParticipant
}) => {
  const VideoTile = ({ 
    stream, 
    participant,
    isLocal = false
  }: {
    stream: MediaStream | null;
    participant: {
      id: string;
      name: string;
      role: 'host' | 'speaker' | 'audience';
      isAudioEnabled: boolean;
      isVideoEnabled: boolean;
      isSpeaking?: boolean;
    } | null;
    isLocal?: boolean;
  }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    const displayName = isLocal ? 'You' : (participant?.name || 'Unknown');
    const isVideoEnabled = isLocal ? localParticipant.isVideoEnabled : (participant?.isVideoEnabled ?? false);
    const isAudioEnabled = isLocal ? localParticipant.isAudioEnabled : (participant?.isAudioEnabled ?? false);

    return (
      <Card className="relative aspect-video bg-gray-800 border-gray-700 overflow-hidden group animate-fade-in">
        {isVideoEnabled && stream ? (
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
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 text-xs">
              {displayName}
              {participant?.role === 'host' && ' (Host)'}
            </Badge>
          </div>
          
          <div className="absolute top-2 right-2 flex gap-1">
            {isAudioEnabled ? (
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
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

          {participant?.isSpeaking && (
            <div className="absolute bottom-2 right-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
        {/* Local Video */}
        <VideoTile 
          stream={localStream}
          participant={{
            id: 'local',
            name: 'You',
            role: 'speaker',
            isAudioEnabled: localParticipant.isAudioEnabled,
            isVideoEnabled: localParticipant.isVideoEnabled
          }}
          isLocal={true}
        />

        {/* Remote Participants */}
        {participants.map((participant) => (
          <VideoTile 
            key={participant.id}
            stream={remoteStreams.get(participant.id) || null}
            participant={participant}
          />
        ))}

        {/* Empty state when no participants */}
        {participants.length === 0 && (
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
