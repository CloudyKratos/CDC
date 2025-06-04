
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageService from '@/services/StageService';
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [userStageRole, setUserStageRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight' | 'circle'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const subscriptionsRef = useRef<{ unsubscribe: () => void }[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  const cleanup = useCallback(() => {
    console.log('Cleaning up subscriptions and resources');
    
    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
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

  const handleConnectionError = useCallback((error: any, context: string) => {
    console.error(`Connection error in ${context}:`, error);
    setConnectionStatus('error');
    setError(`Connection failed: ${context}`);
    
    // Attempt reconnection after delay
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      initializeCall();
    }, 3000);
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
    } catch (error) {
      console.error('Error loading participants:', error);
      handleConnectionError(error, 'loading participants');
    }
  }, [stageId, user?.id, handleConnectionError]);

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
        // Handle stage status changes if needed
      });

      subscriptionsRef.current = [participantSub, stageSub];
      
      return () => {
        participantSub.unsubscribe();
        stageSub.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      handleConnectionError(error, 'setting up subscriptions');
    }
  }, [stageId, loadParticipants, handleConnectionError]);

  const initializeCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log('Initializing stage call for:', stageId);
      
      // Join the stage through StageService
      const joinResult = await StageService.joinStage(stageId, 'audience');
      
      if (joinResult.success) {
        setConnectionStatus('connected');
        await loadParticipants();
        setupRealtimeSubscriptions();
        toast.success('Joined stage successfully!');
      } else {
        setConnectionStatus('disconnected');
        setError(joinResult.error || 'Failed to join stage');
        toast.error(joinResult.error || 'Failed to join stage');
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      handleConnectionError(error, 'initializing call');
    } finally {
      setIsLoading(false);
    }
  }, [stageId, loadParticipants, setupRealtimeSubscriptions, handleConnectionError]);

  useEffect(() => {
    initializeCall();
    
    return cleanup;
  }, [initializeCall, cleanup]);

  const handleToggleAudio = async () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    
    try {
      if (user) {
        await StageService.toggleMute(stageId, user.id, !newAudioState);
        toast.success(newAudioState ? 'Microphone unmuted' : 'Microphone muted');
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setIsAudioEnabled(!newAudioState); // Revert on error
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
    setIsHandRaised(newHandState);
    
    try {
      await StageService.raiseHand(stageId, newHandState);
      toast.success(newHandState ? 'Hand raised' : 'Hand lowered');
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      setIsHandRaised(!newHandState); // Revert on error
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
      await StageService.leaveStage(stageId);
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage');
      onLeave(); // Leave anyway
    }
  };

  const handleRetryConnection = () => {
    setError(null);
    initializeCall();
  };

  if (isLoading) {
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
            <p className="text-lg">Connecting to stage...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <StageHeader
          connectionStatus="error"
          participantCount={0}
          onLeave={onLeave}
          onEndCall={onLeave}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-lg text-destructive">Connection Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button 
              onClick={handleRetryConnection}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry Connection
            </button>
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
        connectionStatus={connectionStatus}
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
