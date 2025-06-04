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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [userStageRole, setUserStageRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight' | 'circle'>('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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
    setConnectionStatus('disconnected');
    setError(`Connection failed: ${context}`);
    
    // Attempt reconnection after delay with exponential backoff
    const delay = Math.min(3000 * Math.pow(2, retryCount), 30000);
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      setRetryCount(prev => prev + 1);
      initializeCall();
    }, delay);
  }, [retryCount]);

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
      setConnectionStatus('connected');
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
        if (payload.eventType === 'UPDATE' && payload.new?.status === 'ended') {
          toast.info('Stage has ended');
          setTimeout(() => onLeave(), 2000);
        }
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
  }, [stageId, loadParticipants, handleConnectionError, onLeave]);

  const validateStageAccess = useCallback(async (): Promise<{ canAccess: boolean; error?: string }> => {
    if (!user) {
      return { canAccess: false, error: 'Please log in to access the stage' };
    }

    try {
      // Use the new validateStageAccess method
      const validation = await StageService.validateStageAccess(stageId);
      if (!validation.canAccess) {
        return { canAccess: false, error: validation.reason };
      }

      return { canAccess: true };
    } catch (error) {
      console.error('Error validating stage access:', error);
      return { canAccess: false, error: 'Failed to validate stage access' };
    }
  }, [user, stageId]);

  const initializeCall = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('connecting');
    
    try {
      console.log('Initializing stage call for:', stageId);
      
      // Validate access first
      const accessValidation = await validateStageAccess();
      if (!accessValidation.canAccess) {
        setConnectionStatus('disconnected');
        setError(accessValidation.error || 'Access denied');
        setIsLoading(false);
        return;
      }

      // Load participants and set up subscriptions
      await loadParticipants();
      setupRealtimeSubscriptions();
      setRetryCount(0); // Reset retry count on success
      toast.success('Connected to stage successfully!');
    } catch (error) {
      console.error('Error initializing call:', error);
      handleConnectionError(error, 'initializing call');
    } finally {
      setIsLoading(false);
    }
  }, [stageId, validateStageAccess, loadParticipants, setupRealtimeSubscriptions, handleConnectionError]);

  useEffect(() => {
    initializeCall();
    
    return cleanup;
  }, [initializeCall, cleanup]);

  const handleToggleAudio = async () => {
    const newAudioState = !isAudioEnabled;
    
    try {
      if (user) {
        setIsAudioEnabled(newAudioState); // Optimistic update
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
    
    try {
      setIsHandRaised(newHandState); // Optimistic update
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
    setRetryCount(0);
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
            <p className="text-sm text-muted-foreground">
              Initializing real-time connection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
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
            <p className="text-sm text-muted-foreground">{error}</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={handleRetryConnection}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Retry Connection
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
