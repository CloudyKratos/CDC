
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoConference } from './hooks/useVideoConference';
import ParticipantVideo from './ParticipantVideo';
import StageControls from './ui/StageControls';
import { getUserName } from '@/utils/user-data';
import { 
  Loader2, 
  Users, 
  Wifi, 
  WifiOff, 
  Settings, 
  Monitor,
  Signal,
  Clock,
  Video as VideoIcon
} from 'lucide-react';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);

  const {
    isConnected,
    isConnecting,
    participants,
    localParticipant,
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isHandRaised,
    isScreenSharing,
    conferenceStats,
    joinConference,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    startScreenShare,
    stopScreenShare
  } = useVideoConference();

  // Auto-join on mount
  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      joinConference(stageId);
    }
  }, [user, stageId, isConnected, isConnecting, joinConference]);

  const handleLeave = async () => {
    await leaveConference();
    onLeave();
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  };

  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count <= 4) return 'grid-cols-2 lg:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3';
    if (count <= 9) return 'grid-cols-3 lg:grid-cols-3';
    return 'grid-cols-3 lg:grid-cols-4';
  };

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">Please log in to join the video conference</p>
            <Button onClick={onLeave}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96 animate-fade-in">
          <CardContent className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Joining Video Conference</h3>
            <p className="text-muted-foreground mb-4">Setting up your connection...</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Initializing camera and microphone</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                <span>Connecting to conference room</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500" />
                <span>Loading participants</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main conference view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">Video Conference</h1>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Room: {stageId.slice(0, 8)}
          </Badge>
          {isScreenSharing && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              <Monitor className="w-3 h-3 mr-1" />
              Screen Sharing
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white/70">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-400" />
                <span className="text-sm text-white/70">Disconnected</span>
              </>
            )}
          </div>

          {/* Participant Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">{participants.length}</span>
          </div>

          {/* Conference Stats */}
          {conferenceStats && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="text-white/70 hover:text-white"
            >
              <Signal className="w-4 h-4" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && conferenceStats && (
        <div className="p-4 bg-black/20 border-b border-white/10">
          <div className="flex items-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{conferenceStats.participantCount} participants</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <VideoIcon className="w-4 h-4" />
              <span>Video: {conferenceStats.videoQuality}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Signal className="w-4 h-4" />
              <span>Audio: {conferenceStats.audioQuality}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{conferenceStats.networkLatency}ms latency</span>
            </div>
          </div>
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 p-6 overflow-auto">
        {participants.length > 0 ? (
          <div className={`grid ${getGridCols(participants.length)} gap-4 h-full min-h-0`}>
            {participants.map((participant) => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                isLocal={participant.id === user.id}
                isActiveSpeaker={participant.isSpeaking}
                className="min-h-0"
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="text-center p-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Waiting for participants</h3>
                <p className="text-muted-foreground">
                  Share the room ID with others to start the video conference
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <StageControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isHandRaised={isHandRaised}
          userRole="speaker"
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onRaiseHand={toggleHandRaise}
          onToggleChat={() => {}} // TODO: Implement chat
          onLeave={handleLeave}
        />
        
        {/* Additional controls */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleScreenShare}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Monitor className="w-4 h-4 mr-2" />
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StageRoom;
