
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRealTimeStage } from './hooks/useRealTimeStage';
import { useStageChat } from './hooks/useStageChat';
import StageVideoGrid from './components/StageVideoGrid';
import StageControls from './components/StageControls';
import StageHeader from './components/StageHeader';
import StageSidebar from './components/StageSidebar';
import StageChat from './components/StageChat';
import { getUserName } from '@/utils/user-data';
import { Loader2 } from 'lucide-react';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHost] = useState(true); // For demo - in real app, determine from backend
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Use the new real-time stage hook
  const {
    isConnected,
    isConnecting,
    participants,
    localStream,
    remoteStreams,
    mediaState,
    error,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    screenShareStream
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

  const handleStartRecording = () => {
    setIsRecording(true);
    addSystemMessage("Recording started");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    addSystemMessage("Recording stopped");
  };

  const handleSendChatMessage = (message: string) => {
    addMessage({
      userId: user?.id || 'unknown',
      userName: getUserName(user),
      message,
      type: 'text'
    });
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      clearUnread();
    }
  };

  // Create participants list including current user
  const allParticipants = [
    {
      id: user?.id || 'local-user',
      name: getUserName(user),
      role: isHost ? 'host' as const : 'speaker' as const,
      isAudioEnabled: mediaState.isAudioEnabled,
      isVideoEnabled: mediaState.isVideoEnabled,
      isSpeaking: false,
      isHandRaised,
      isScreenSharing: mediaState.isScreenSharing
    },
    ...participants.map(p => ({
      id: p.userId,
      name: `User ${p.userId.slice(0, 8)}`,
      role: 'speaker' as const,
      isAudioEnabled: p.mediaState.isAudioEnabled,
      isVideoEnabled: p.mediaState.isVideoEnabled,
      isSpeaking: false,
      isHandRaised: false,
      isScreenSharing: p.mediaState.isScreenSharing
    }))
  ];

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
            <p className="text-muted-foreground">Setting up your connection...</p>
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
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.reload()}>
                Retry
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col overflow-hidden">
      {/* Stage Header */}
      <StageHeader 
        stageId={stageId}
        connectionState={isConnected ? 'connected' : 'disconnected'}
        participantCount={allParticipants.length}
        networkQuality={{ quality: 'good', ping: 0, bandwidth: 0 }}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onLeave={handleLeave}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Grid */}
        <div className="flex-1 pb-20">
          <StageVideoGrid 
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={allParticipants}
            localParticipant={{
              isAudioEnabled: mediaState.isAudioEnabled,
              isVideoEnabled: mediaState.isVideoEnabled
            }}
            currentUserId={user.id}
            isHost={isHost}
            screenShareStream={screenShareStream}
            isScreenSharing={mediaState.isScreenSharing}
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <StageSidebar 
            stageId={stageId}
            participants={allParticipants}
            onClose={() => setShowSidebar(false)}
          />
        )}

        {/* Chat */}
        {showChat && (
          <StageChat
            messages={messages}
            onSendMessage={handleSendChatMessage}
            onClose={handleToggleChat}
            currentUserId={user.id}
            currentUserName={getUserName(user)}
          />
        )}
      </div>

      {/* Stage Controls */}
      <StageControls 
        isAudioEnabled={mediaState.isAudioEnabled}
        isVideoEnabled={mediaState.isVideoEnabled}
        audioDevices={[]}
        videoDevices={[]}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onSwitchAudioDevice={() => {}}
        onSwitchVideoDevice={() => {}}
        onToggleScreenShare={handleScreenShare}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onRaiseHand={handleRaiseHand}
        onToggleChat={handleToggleChat}
        onLeave={handleLeave}
        isHost={isHost}
        isHandRaised={isHandRaised}
        isRecording={isRecording}
        isScreenSharing={mediaState.isScreenSharing}
        participantCount={allParticipants.length}
        stageId={stageId}
      />
    </div>
  );
};

export default StageRoom;
