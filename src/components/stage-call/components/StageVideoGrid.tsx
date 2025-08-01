
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Crown,
  Hand,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'speaker' | 'audience';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isScreenSharing?: boolean;
}

interface StageVideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  localParticipant: {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean;
  };
  currentUserId: string;
  isHost: boolean;
  screenShareStream?: MediaStream | null;
  isScreenSharing?: boolean;
}

const StageVideoGrid: React.FC<StageVideoGridProps> = ({
  localStream,
  remoteStreams,
  participants,
  localParticipant,
  currentUserId,
  isHost,
  screenShareStream,
  isScreenSharing = false
}) => {
  const VideoTile: React.FC<{
    participant: Participant;
    stream?: MediaStream;
    isLocal?: boolean;
  }> = ({ participant, stream, isLocal = false }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    
    React.useEffect(() => {
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }
    }, [stream]);

    const isCurrentUser = participant.id === currentUserId;
    const showVideo = isLocal ? localParticipant.isVideoEnabled : participant.isVideoEnabled;
    const isAudioEnabled = isLocal ? localParticipant.isAudioEnabled : participant.isAudioEnabled;

    return (
      <Card className={cn(
        "relative overflow-hidden bg-gray-900 border-gray-700",
        participant.isSpeaking && "ring-2 ring-green-500",
        isCurrentUser && "ring-2 ring-blue-500"
      )}>
        {/* Video Element */}
        {showVideo && stream ? (
          <video
            ref={videoRef}
            autoPlay
            muted={isLocal}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-white">
                {participant.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Overlay Information */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Top Right - Status Indicators */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {participant.role === 'host' && (
            <Badge variant="secondary" className="bg-yellow-600/80 text-yellow-100">
              <Crown className="w-3 h-3 mr-1" />
              Host
            </Badge>
          )}
          {participant.isHandRaised && (
            <div className="p-1 bg-yellow-600 rounded-full animate-bounce">
              <Hand className="w-3 h-3 text-white" />
            </div>
          )}
          {participant.isScreenSharing && (
            <div className="p-1 bg-blue-600 rounded-full">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Bottom Left - Name and Audio Status */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2">
          <div className={cn(
            "p-1 rounded-full",
            isAudioEnabled ? "bg-green-600" : "bg-red-600"
          )}>
            {isAudioEnabled ? (
              <Mic className="w-3 h-3 text-white" />
            ) : (
              <MicOff className="w-3 h-3 text-white" />
            )}
          </div>
          <span className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded">
            {participant.name}
            {isCurrentUser && ' (You)'}
          </span>
        </div>

        {/* Video Off Indicator */}
        {!showVideo && (
          <div className="absolute bottom-2 right-2">
            <div className="p-1 bg-gray-600 rounded-full">
              <VideoOff className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </Card>
    );
  };

  const ScreenShareDisplay: React.FC = () => {
    const screenVideoRef = React.useRef<HTMLVideoElement>(null);
    
    React.useEffect(() => {
      if (screenVideoRef.current && screenShareStream) {
        screenVideoRef.current.srcObject = screenShareStream;
        console.log('Screen share stream set to video element');
      }
    }, []);

    if (!screenShareStream) return null;

    return (
      <Card className="h-full bg-black border-gray-700 overflow-hidden">
        <div className="relative h-full">
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain bg-black"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-blue-600/80 text-blue-100 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Screen Share
            </Badge>
          </div>
        </div>
      </Card>
    );
  };

  if (isScreenSharing && screenShareStream) {
    return (
      <div className="h-full flex flex-col gap-4 p-4">
        {/* Screen Share - Takes most of the space */}
        <div className="flex-1">
          <ScreenShareDisplay />
        </div>
        
        {/* Participant Thumbnails */}
        <div className="h-32 flex gap-2 overflow-x-auto">
          {/* Local participant */}
          <div className="min-w-48">
            <VideoTile
              participant={{
                id: currentUserId,
                name: participants.find(p => p.id === currentUserId)?.name || 'You',
                role: isHost ? 'host' : 'speaker',
                isAudioEnabled: localParticipant.isAudioEnabled,
                isVideoEnabled: localParticipant.isVideoEnabled,
                isSpeaking: false,
                isHandRaised: participants.find(p => p.id === currentUserId)?.isHandRaised || false
              }}
              stream={localStream || undefined}
              isLocal={true}
            />
          </div>
          
          {/* Remote participants */}
          {participants.filter(p => p.id !== currentUserId).map((participant) => (
            <div key={participant.id} className="min-w-48">
              <VideoTile
                participant={participant}
                stream={remoteStreams.get(participant.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Normal grid layout when no screen sharing
  return (
    <div className="h-full p-4">
      <div className={cn(
        "grid gap-4 h-full",
        participants.length === 1 && "grid-cols-1",
        participants.length === 2 && "grid-cols-2",
        participants.length <= 4 && participants.length > 2 && "grid-cols-2 grid-rows-2",
        participants.length > 4 && "grid-cols-3 auto-rows-fr"
      )}>
        {/* Local participant */}
        <VideoTile
          participant={{
            id: currentUserId,
            name: participants.find(p => p.id === currentUserId)?.name || 'You',
            role: isHost ? 'host' : 'speaker',
            isAudioEnabled: localParticipant.isAudioEnabled,
            isVideoEnabled: localParticipant.isVideoEnabled,
            isSpeaking: false,
            isHandRaised: participants.find(p => p.id === currentUserId)?.isHandRaised || false
          }}
          stream={localStream || undefined}
          isLocal={true}
        />
        
        {/* Remote participants */}
        {participants.filter(p => p.id !== currentUserId).map((participant) => (
          <VideoTile
            key={participant.id}
            participant={participant}
            stream={remoteStreams.get(participant.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default StageVideoGrid;
