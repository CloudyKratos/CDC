
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeStage } from './hooks/useRealTimeStage';
import { useStageChat } from './hooks/useStageChat';
import ParticipantVideo from './ParticipantVideo';
import StageControls from './ui/StageControls';
import { getUserName } from '@/utils/user-data';
import { Loader2, Users, Wifi, WifiOff, Settings } from 'lucide-react';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [showChat, setShowChat] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);

  // Use the improved real-time stage hook
  const {
    isConnected,
    isConnecting,
    callState,
    localStream,
    remoteStreams,
    participants,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    error,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare
  } = useRealTimeStage(stageId);

  const {
    messages,
    unreadCount,
    addMessage,
    addSystemMessage,
    clearUnread
  } = useStageChat();

  const handleLeave = async () => {
    try {
      await disconnect();
      addSystemMessage(`${getUserName(user)} left the stage`);
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave();
    }
  };

  const handleToggleAudio = async () => {
    const enabled = await toggleAudio();
    addSystemMessage(`${getUserName(user)} ${enabled ? 'unmuted' : 'muted'} their microphone`);
  };

  const handleToggleVideo = async () => {
    const enabled = await toggleVideo();
    addSystemMessage(`${getUserName(user)} turned their camera ${enabled ? 'on' : 'off'}`);
  };

  const handleScreenShare = async () => {
    const isSharing = await toggleScreenShare();
    addSystemMessage(`${getUserName(user)} ${isSharing ? 'started' : 'stopped'} screen sharing`);
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    const message = isHandRaised ? 'lowered their hand' : 'raised their hand';
    addSystemMessage(`${getUserName(user)} ${message}`);
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      clearUnread();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">Please log in to join the stage</p>
            <Button onClick={onLeave}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96 animate-fade-in">
          <CardContent className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Connecting to Stage</h3>
            <p className="text-muted-foreground mb-4">Setting up your connection...</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Initializing media devices</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200" />
                <span>Establishing WebRTC connection</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-500" />
                <span>Joining stage room</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <WifiOff className="w-8 h-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retry Connection
              </Button>
              <Button variant="outline" onClick={onLeave}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Create video grid layout
  const allParticipants = [
    // Current user
    {
      userId: user.id,
      name: getUserName(user),
      role: 'moderator' as const,
      stream: localStream,
      isAudioEnabled,
      isVideoEnabled,
      isHandRaised,
      isSpeaking: false,
      isLocal: true
    },
    // Remote participants
    ...participants
      .filter(p => p.userId !== user.id)
      .map(p => ({
        userId: p.userId,
        name: p.name,
        role: 'speaker' as const,
        stream: remoteStreams.get(p.userId),
        isAudioEnabled: p.isAudioEnabled,
        isVideoEnabled: p.isVideoEnabled,
        isHandRaised: false,
        isSpeaking: p.isSpeaking,
        isLocal: false
      }))
  ];

  const getGridLayout = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-white">Stage Room</h1>
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
            Stage ID: {stageId.slice(0, 8)}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm text-white/70">
              {callState === 'connected' ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          {/* Participant Count */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">{allParticipants.length}</span>
          </div>

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

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Video Grid */}
        <div className="h-full p-6">
          {allParticipants.length > 0 ? (
            <div className={`grid ${getGridLayout(allParticipants.length)} gap-4 h-full`}>
              {allParticipants.map((participant) => (
                <ParticipantVideo
                  key={participant.userId}
                  userId={participant.userId}
                  name={participant.name}
                  role={participant.role}
                  stream={participant.stream}
                  isAudioEnabled={participant.isAudioEnabled}
                  isVideoEnabled={participant.isVideoEnabled}
                  isHandRaised={participant.isHandRaised}
                  isSpeaking={participant.isSpeaking}
                  isLocal={participant.isLocal}
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
                    Share the stage ID with others to start the meeting
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Screen Share Indicator */}
        {isScreenSharing && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              You are sharing your screen
            </Badge>
          </div>
        )}

        {/* Chat Sidebar */}
        {showChat && (
          <div className="absolute top-0 right-0 w-80 h-full bg-black/80 backdrop-blur-sm border-l border-white/10">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Chat</h3>
              {/* Chat content would go here */}
              <div className="text-center text-muted-foreground">
                Chat functionality coming soon
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0">
        <StageControls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isHandRaised={isHandRaised}
          userRole="moderator"
          onToggleAudio={handleToggleAudio}
          onToggleVideo={handleToggleVideo}
          onRaiseHand={handleRaiseHand}
          onToggleChat={handleToggleChat}
          onLeave={handleLeave}
        />
      </div>
    </div>
  );
};

export default StageRoom;
