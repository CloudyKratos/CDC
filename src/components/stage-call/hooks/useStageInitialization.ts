
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import RealTimeStageService from '@/services/RealTimeStageService';
import WebRTCStageService from '@/services/WebRTCStageService';
import StageCleanupService from '@/services/StageCleanupService';
import { useStageOrchestrator } from './useStageOrchestrator';

interface UseStageInitializationProps {
  stageId: string;
  onLeave: () => void;
}

export const useStageInitialization = ({ stageId, onLeave }: UseStageInitializationProps) => {
  const { user } = useAuth();
  const [isJoining, setIsJoining] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  const {
    state,
    initializeStage,
    leaveStage
  } = useStageOrchestrator();

  useEffect(() => {
    const initializeStageRoom = async () => {
      if (!user || isJoining) return;

      setIsJoining(true);
      
      try {
        console.log('Initializing enhanced stage room for user:', user.id);
        
        toast.info('Connecting to stage...', {
          duration: 2000,
          description: 'Setting up audio, video and real-time features'
        });

        // Clean up any existing sessions first
        await StageCleanupService.getInstance().forceCleanupUserParticipation(stageId, user.id);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Initialize WebRTC first
        const stream = await WebRTCStageService.initializeMedia({
          audio: true,
          video: true
        });
        setLocalStream(stream);

        // Set up WebRTC event handlers
        WebRTCStageService.on('remoteStream', ({ userId, stream }) => {
          setRemoteStreams(prev => new Map(prev.set(userId, stream)));
        });

        // Join real-time stage with retry logic
        let joined = false;
        let retryCount = 0;
        const maxRetries = 3;

        while (!joined && retryCount < maxRetries) {
          try {
            joined = await RealTimeStageService.joinStage(stageId, user.id, 'audience');
            if (!joined) {
              throw new Error('Failed to join real-time stage');
            }
          } catch (error: any) {
            retryCount++;
            console.warn(`Join attempt ${retryCount} failed:`, error);
            
            if (error?.message?.includes('duplicate key') && retryCount < maxRetries) {
              console.log('Duplicate key detected, cleaning up and retrying...');
              await StageCleanupService.getInstance().forceCleanupUserParticipation(stageId, user.id);
              await new Promise(resolve => setTimeout(resolve, 2000 * retryCount)); // Exponential backoff
            } else if (retryCount >= maxRetries) {
              throw error;
            }
          }
        }

        // Initialize stage orchestrator
        const result = await initializeStage({
          stageId,
          userId: user.id,
          userRole: 'audience',
          mediaConstraints: {
            audio: true,
            video: true
          },
          qualitySettings: {
            maxBitrate: 2500000,
            adaptiveStreaming: true,
            lowLatencyMode: true
          }
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to initialize stage');
        }

        toast.success('Connected to stage!', {
          description: 'All features are now active'
        });
      } catch (error) {
        console.error('Failed to initialize stage room:', error);
        
        let errorMessage = 'Please try again';
        if (error instanceof Error) {
          if (error.message.includes('duplicate key')) {
            errorMessage = 'Session conflict detected. Please try force reconnecting.';
          } else {
            errorMessage = error.message;
          }
        }
        
        toast.error('Connection failed', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => initializeStageRoom()
          }
        });
      } finally {
        setIsJoining(false);
      }
    };

    initializeStageRoom();

    return () => {
      handleLeave();
    };
  }, [stageId, user]);

  const handleLeave = async () => {
    try {
      toast.info('Leaving stage...', { duration: 1000 });
      
      if (user) {
        await RealTimeStageService.leaveStage(user.id);
      }
      
      WebRTCStageService.cleanup();
      await leaveStage();
      
      toast.success('Left the stage', { duration: 2000 });
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage');
      onLeave();
    }
  };

  return {
    state,
    isJoining,
    localStream,
    remoteStreams,
    handleLeave
  };
};
