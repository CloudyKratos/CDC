
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageService from '@/services/StageService';
import { useStageConnection } from '@/hooks/useStageConnection';
import StageHeader from './components/StageHeader';
import EnhancedParticipantGrid from './components/EnhancedParticipantGrid';
import EnhancedStageControls from './components/EnhancedStageControls';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import '@/styles/stage-effects.css';

interface RealTimeStageCallProps {
  stageId: string;
  onLeave: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  avatarUrl?: string;
}

const RealTimeStageCall: React.FC<RealTimeStageCallProps> = ({
  stageId,
  onLeave
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [userStageRole, setUserStageRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight' | 'circle'>('grid');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([]);
  const { user } = useAuth();
  const { 
    isConnecting, 
    connectionError, 
    isConnected, 
    connect, 
    disconnect, 
    forceReconnect, 
    clearError,
    connectionState
  } = useStageConnection();

  const cleanup = useCallback(() => {
    console.log('Cleaning up stage call resources');
    
    // Unsubscribe from all channels
    subscriptionsRef.current.forEach(sub => {
      try {
        sub.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    });
    subscriptionsRef.current = [];
  }, []);

  const loadParticipants = useCallback(async () => {
    try {
      console.log('Loading participants for stage:', stageId);
      const participantData = await StageService.getStageParticipants(stageId);
      
      const formattedParticipants: Participant[] = participantData.map(p => ({
        id: p.user_id,
        name: p.profiles?.full_name || p.profiles?.username || 'Anonymous',
        role: p.role,
        isAudioEnabled: !p.is_muted,
        isVideoEnabled: p.is_video_enabled || false,
        isMuted: p.is_muted,
        isHandRaised: p.is_hand_raised,
        isSpeaking: false,
        audioLevel: 0,
        avatarUrl: p.profiles?.avatar_url
      }));
      
      setParticipants(formattedParticipants);
      
      // Determine current user's role
      const currentUserParticipant = participantData.find(p => p.user_id === user?.id);
      if (currentUserParticipant) {
        setUserStageRole(currentUserParticipant.role);
        setIsHandRaised(currentUserParticipant.is_hand_raised);
        setIsAudioEnabled(!currentUserParticipant.is_muted);
        setIsVideoEnabled(currentUserParticipant.is_video_enabled || false);
      }
      
      console.log('Participants loaded successfully:', formattedParticipants.length);
    } catch (error) {
      console.error('Error loading participants:', error);
      toast.error('Failed to load participants');
    }
  }, [stageId, user?.id]);

  const setupRealtimeSubscriptions = useCallback(() => {
    console.log('Setting up realtime subscriptions');
    
    try {
      // Subscribe to participant changes
      const participantSub = StageService.subscribeToParticipants(stageId, (payload) => {
        console.log('Participant update received:', payload);
        loadParticipants();
      });

      // Subscribe to stage updates
      const stageSub = StageService.subscribeToStageUpdates(stageId, (payload) => {
        console.log('Stage update received:', payload);
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'ended') {
          toast.info('Stage has ended');
          setTimeout(() => onLeave(), 2000);
        }
      });

      subscriptionsRef.current = [participantSub, stageSub];
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      toast.error('Failed to setup real-time updates');
    }
  }, [stageId, loadParticipants, onLeave]);

  const initializeStage = useCallback(async () => {
    clearError();
    
    try {
      console.log('Initializing stage connection...');
      await connect(stageId);
      
      // Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await loadParticipants();
      setupRealtimeSubscriptions();
    } catch (error) {
      console.error('Error initializing stage:', error);
    }
  }, [stageId, connect, loadParticipants, setupRealtimeSubscriptions, clearError]);

  useEffect(() => {
    initializeStage();
    
    return cleanup;
  }, [initializeStage, cleanup]);

  const handleToggleAudio = async () => {
    const newAudioState = !isAudioEnabled;
    
    try {
      if (user) {
        setIsAudioEnabled(newAudioState);
        await StageService.toggleMute(stageId, user.id, !newAudioState);
        toast.success(newAudioState ? 'Microphone unmuted' : 'Microphone muted');
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setIsAudioEnabled(!newAudioState);
      toast.error('Failed to toggle microphone');
    }
  };

  const handleToggleVideo = () => {
    const newVideoState = !isVideoEnabled;
    setIsVideoEnabled(newVideoState);
    toast.success(newVideoState ? 'Camera on' : 'Camera off');
  };

  const handleToggleHandRaise = async () => {
    const newHandState = !isHandRaised;
    
    try {
      setIsHandRaised(newHandState);
      await StageService.raiseHand(stageId, newHandState);
      toast.success(newHandState ? 'Hand raised' : 'Hand lowered');
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      setIsHandRaised(!newHandState);
      toast.error('Failed to update hand status');
    }
  };

  const handleStartScreenShare = () => {
    setIsScreenSharing(true);
    toast.success('Screen sharing started');
  };

  const handleStopScreenShare = () => {
    setIsScreenSharing(false);
    toast.success('Screen sharing stopped');
  };

  const handleLayoutChange = (mode: 'grid' | 'spotlight' | 'circle') => {
    setLayoutMode(mode);
    toast.success(`Switched to ${mode} view`);
  };

  const handleLeaveCall = async () => {
    try {
      cleanup();
      await disconnect();
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave(); // Leave anyway
    }
  };

  const handleForceReconnect = async () => {
    try {
      await forceReconnect(stageId);
      
      // Wait for reconnection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await loadParticipants();
      setupRealtimeSubscriptions();
    } catch (error) {
      console.error('Error during force reconnect:', error);
    }
  };

  // Enhanced connection status display
  const getConnectionStatusMessage = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting to stage...';
      case 'connected':
        return 'Connected';
      case 'error':
        return connectionError || 'Connection error';
      default:
        return 'Disconnected';
    }
  };

  if (isConnecting || connectionState === 'connecting') {
    return (
      <div className="flex flex-col h-full">
        <StageHeader
          connectionStatus="connecting"
          participantCount={0}
          onLeave={onLeave}
          onEndCall={onLeave}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-lg">{getConnectionStatusMessage()}</p>
            <p className="text-sm text-muted-foreground">
              Establishing secure connection and setting up real-time features...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (connectionError || connectionState === 'error') {
    return (
      <div className="flex flex-col h-full">
        <StageHeader
          connectionStatus="disconnected"
          participantCount={0}
          onLeave={onLeave}
          onEndCall={onLeave}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-lg text-destructive">Connection Error</p>
            <p className="text-sm text-muted-foreground">{connectionError}</p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Having trouble connecting? Try force reconnecting to clean up any previous sessions.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleForceReconnect}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Force Reconnect
              </button>
              <button 
                onClick={onLeave}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Leave Stage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const speakers = participants.filter(p => ['speaker', 'moderator'].includes(p.role));
  const listeners = participants.filter(p => p.role === 'audience');
  const canSpeak = ['speaker', 'moderator'].includes(userStageRole);
  const canModerate = userStageRole === 'moderator';

  return (
    <div className={cn(
      "flex flex-col h-full relative overflow-hidden",
      "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg opacity-20" />
      
      {/* Stage Header */}
      <StageHeader
        connectionStatus={isConnected ? 'connected' : 'disconnected'}
        participantCount={participants.length + 1}
        onLeave={handleLeaveCall}
        onEndCall={handleLeaveCall}
      />

      {/* Main Stage Area */}
      <EnhancedParticipantGrid
        speakers={speakers}
        listeners={listeners}
        localVideoRef={localVideoRef}
        user={user}
        userStageRole={userStageRole}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isHandRaised={isHandRaised}
        activeSpeaker={activeSpeaker}
        canModerate={canModerate}
        layoutMode={layoutMode}
      />

      {/* Enhanced Controls */}
      <EnhancedStageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        canSpeak={canSpeak}
        layoutMode={layoutMode}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleHandRaise={handleToggleHandRaise}
        onStartScreenShare={handleStartScreenShare}
        onStopScreenShare={handleStopScreenShare}
        onLeaveCall={handleLeaveCall}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
};

export default RealTimeStageCall;
