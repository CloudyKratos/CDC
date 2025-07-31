
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { useStageConnection } from './hooks/useStageConnection';
import StageVideoGrid from './components/StageVideoGrid';
import StageControls from './components/StageControls';
import StageHeader from './components/StageHeader';
import StageSidebar from './components/StageSidebar';
import { Loader2 } from 'lucide-react';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<{
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
  }>({ audio: [], video: [] });
  
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
        
        // First connect using the hook
        await connect({
          stageId,
          userId: user.id,
          role: 'speaker' // Default to speaker for community meetings
        });

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

    return () => {
      handleLeave();
    };
  }, [stageId, user]);

  const handleLeave = async () => {
    try {
      await leaveStage();
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

  // Mock participants for community meeting
  const mockParticipants = [
    {
      id: user.id,
      name: user.full_name || user.email || 'You',
      role: 'speaker' as const,
      isAudioEnabled: state.mediaState.audioEnabled,
      isVideoEnabled: state.mediaState.videoEnabled,
      isSpeaking: false
    },
    {
      id: 'community-host',
      name: 'Community Host',
      role: 'host' as const,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isSpeaking: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
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
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1">
          <StageVideoGrid 
            localStream={localStream}
            remoteStreams={remoteStreams}
            participants={mockParticipants}
            localParticipant={{
              isAudioEnabled: state.mediaState.audioEnabled,
              isVideoEnabled: state.mediaState.videoEnabled
            }}
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
        onLeave={handleLeave}
      />
    </div>
  );
};

export default StageRoom;
