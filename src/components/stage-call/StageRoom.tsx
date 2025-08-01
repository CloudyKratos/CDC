import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { useStageConnection } from './hooks/useStageConnection';
import { useStageWebRTC } from './hooks/useStageWebRTC';
import { useStageChat } from './hooks/useStageChat';
import { useStageMediaCleanup } from './hooks/useStageMediaCleanup';
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
  const { toast } = useToast();
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenShareStream, setScreenShareStream] = useState<MediaStream | null>(null);
  const [availableDevices, setAvailableDevices] = useState<{
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
  }>({ audio: [], video: [] });
  
  const { registerStream, cleanupAllStreams, cleanupSpecificStream } = useStageMediaCleanup();
  const screenShareRef = useRef<MediaStream | null>(null);
  
  const {
    state,
    isInitialized,
    initializeStage,
    leaveStage,
    toggleAudio,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice
  } = useStageOrchestrator();

  const {
    localStream,
    remoteStreams,
    isConnected,
    connectionError,
    connect
  } = useStageConnection();

  const {
    remoteStreams: webrtcRemoteStreams,
    createOffer,
    sendControlMessage
  } = useStageWebRTC(localStream);

  const {
    messages,
    unreadCount,
    addMessage,
    addSystemMessage,
    clearUnread
  } = useStageChat();

  // Register local stream for cleanup
  useEffect(() => {
    if (localStream) {
      registerStream(localStream);
    }
  }, [localStream, registerStream]);

  // Register screen share stream for cleanup
  useEffect(() => {
    if (screenShareStream) {
      registerStream(screenShareStream);
    }
  }, [screenShareStream, registerStream]);

  // Get available devices on mount
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAvailableDevices({
          audio: devices.filter(device => device.kind === 'audioinput'),
          video: devices.filter(device => device.kind === 'videoinput')
        });
      } catch (error) {
        console.error('Error getting devices:', error);
      }
    };

    getDevices();
  }, []);

  useEffect(() => {
    const initStage = async () => {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to join the stage",
          variant: "destructive",
        });
        return;
      }

      try {
        console.log('Initializing stage room for community meeting:', stageId);
        
        // Check if user is host (could be determined by backend)
        setIsHost(true); // For demo purposes, set first user as host
        
        // Connect using the hook
        await connect({
          stageId,
          userId: user.id,
          role: 'speaker'
        });

        addSystemMessage(`${getUserName(user)} joined the stage`);

        toast({
          title: "Connected to Community Meeting",
          description: "You've successfully joined the stage",
        });

      } catch (error) {
        console.error('Failed to initialize stage:', error);
        toast({
          title: "Connection Failed",
          description: error instanceof Error ? error.message : "Failed to join community meeting",
          variant: "destructive",
        });
      }
    };

    if (stageId && user) {
      initStage();
    }

    // Cleanup function
    return () => {
      handleLeaveCleanup();
    };
  }, [stageId, user]);

  const handleLeaveCleanup = async () => {
    console.log('Cleaning up stage room...');
    
    try {
      // Stop screen sharing if active
      if (screenShareRef.current) {
        screenShareRef.current.getTracks().forEach(track => {
          console.log('Stopping screen share track:', track.kind);
          track.stop();
        });
        screenShareRef.current = null;
      }
      
      // Cleanup all registered streams
      cleanupAllStreams();
      
      // Leave stage through orchestrator
      await leaveStage();
      
      console.log('Stage cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  };

  const handleLeave = async () => {
    try {
      await handleLeaveCleanup();
      addSystemMessage(`${getUserName(user)} left the stage`);
      onLeave();
      
      toast({
        title: "Left Meeting",
        description: "You've left the community meeting",
      });
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave();
    }
  };

  const handleToggleAudio = async () => {
    try {
      const enabled = await toggleAudio();
      addSystemMessage(`${getUserName(user)} ${enabled ? 'unmuted' : 'muted'} their microphone`);
      
      // Send control message to other participants
      sendControlMessage({
        type: 'audio-toggle',
        userId: user?.id,
        enabled
      });
      
      toast({
        title: enabled ? "Microphone On" : "Microphone Off",
        description: enabled ? "You are now unmuted" : "You are now muted",
      });
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast({
        title: "Error",
        description: "Failed to toggle microphone",
        variant: "destructive",
      });
    }
  };

  const handleToggleVideo = async () => {
    try {
      const enabled = await toggleVideo();
      addSystemMessage(`${getUserName(user)} turned their camera ${enabled ? 'on' : 'off'}`);
      
      // Send control message to other participants
      sendControlMessage({
        type: 'video-toggle',
        userId: user?.id,
        enabled
      });
      
      toast({
        title: enabled ? "Camera On" : "Camera Off",
        description: enabled ? "Your camera is now on" : "Your camera is now off",
      });
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        title: "Error",
        description: "Failed to toggle camera",
        variant: "destructive",
      });
    }
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    const message = isHandRaised ? 'lowered their hand' : 'raised their hand';
    addSystemMessage(`${getUserName(user)} ${message}`);
    
    // Send control message to other participants
    sendControlMessage({
      type: 'hand-raise',
      userId: user?.id,
      raised: !isHandRaised
    });
    
    toast({
      title: isHandRaised ? "Hand Lowered" : "Hand Raised",
      description: isHandRaised ? "You lowered your hand" : "You raised your hand",
    });
  };

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing && screenShareRef.current) {
        // Stop screen sharing
        console.log('Stopping screen share...');
        screenShareRef.current.getTracks().forEach(track => {
          console.log('Stopping screen share track:', track.kind);
          track.stop();
        });
        
        cleanupSpecificStream(screenShareRef.current);
        screenShareRef.current = null;
        setScreenShareStream(null);
        setIsScreenSharing(false);
        
        addSystemMessage(`${getUserName(user)} stopped screen sharing`);
        toast({
          title: "Screen Sharing Stopped",
          description: "You stopped sharing your screen",
        });
      } else {
        // Start screen sharing
        console.log('Starting screen share...');
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
        
        screenShareRef.current = displayStream;
        setScreenShareStream(displayStream);
        registerStream(displayStream);
        setIsScreenSharing(true);
        
        addSystemMessage(`${getUserName(user)} started screen sharing`);
        
        // Handle stream ended (user stops sharing via browser)
        displayStream.getVideoTracks()[0].addEventListener('ended', () => {
          console.log('Screen share ended by user');
          setIsScreenSharing(false);
          setScreenShareStream(null);
          screenShareRef.current = null;
          addSystemMessage(`${getUserName(user)} stopped screen sharing`);
        });
        
        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen",
        });
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        title: "Screen Share Error",
        description: error instanceof Error ? error.message : "Failed to toggle screen sharing",
        variant: "destructive",
      });
    }
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    addSystemMessage("Recording started");
    toast({
      title: "Recording Started",
      description: "The stage session is now being recorded",
    });
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    addSystemMessage("Recording stopped");
    toast({
      title: "Recording Stopped",
      description: "The recording has been saved",
    });
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

  // Mock participants for demonstration - include screen share stream
  const mockParticipants = [
    {
      id: user?.id || 'local-user',
      name: getUserName(user),
      role: isHost ? 'host' as const : 'speaker' as const,
      isAudioEnabled: state.mediaState.audioEnabled,
      isVideoEnabled: state.mediaState.videoEnabled,
      isSpeaking: false,
      isHandRaised,
      isScreenSharing
    },
    {
      id: 'demo-participant-1',
      name: 'Sarah Wilson',
      role: 'speaker' as const,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isSpeaking: false,
      isHandRaised: false,
      isScreenSharing: false
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">Please log in to join the community meeting</p>
            <Button onClick={onLeave}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isInitialized && (state.connectionState === 'connecting' || state.isConnecting)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96 animate-fade-in">
          <CardContent className="text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Joining Community Meeting</h3>
            <p className="text-muted-foreground">Setting up your connection...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state.connectionState === 'error' || connectionError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connection Failed</h3>
            <p className="text-muted-foreground mb-4">
              {connectionError || state.errors.join(', ') || 'Unable to connect to the community meeting'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => connect({ 
                stageId, 
                userId: user.id,
                role: 'speaker'
              })}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col overflow-hidden">
      {/* Stage Header */}
      <StageHeader 
        stageId={stageId}
        connectionState={state.connectionState}
        participantCount={mockParticipants.length}
        networkQuality={state.networkQuality}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onLeave={handleLeave}
      />

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Video Grid */}
        <div className="flex-1 pb-20">
          <StageVideoGrid 
            localStream={localStream}
            remoteStreams={remoteStreams.size > 0 ? remoteStreams : webrtcRemoteStreams}
            participants={mockParticipants}
            localParticipant={{
              isAudioEnabled: state.mediaState.audioEnabled,
              isVideoEnabled: state.mediaState.videoEnabled
            }}
            currentUserId={user.id}
            isHost={isHost}
            screenShareStream={screenShareStream}
            isScreenSharing={isScreenSharing}
          />
        </div>

        {/* Sidebar */}
        {showSidebar && (
          <StageSidebar 
            stageId={stageId}
            participants={mockParticipants}
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
        isAudioEnabled={state.mediaState.audioEnabled}
        isVideoEnabled={state.mediaState.videoEnabled}
        audioDevices={availableDevices.audio}
        videoDevices={availableDevices.video}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onSwitchAudioDevice={switchAudioDevice}
        onSwitchVideoDevice={switchVideoDevice}
        onToggleScreenShare={handleScreenShare}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onRaiseHand={handleRaiseHand}
        onToggleChat={handleToggleChat}
        onLeave={handleLeave}
        isHost={isHost}
        isHandRaised={isHandRaised}
        isRecording={isRecording}
        isScreenSharing={isScreenSharing}
        participantCount={mockParticipants.length}
        stageId={stageId}
      />
    </div>
  );
};

export default StageRoom;
