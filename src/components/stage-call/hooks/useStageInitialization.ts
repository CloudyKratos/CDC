
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

        // Enhanced cleanup with multiple attempts
        await performCleanupWithRetry(stageId, user.id);

        // Initialize WebRTC first with error handling
        const stream = await initializeMediaWithFallback();
        setLocalStream(stream);

        // Set up WebRTC event handlers
        WebRTCStageService.on('remoteStream', ({ userId, stream }) => {
          setRemoteStreams(prev => new Map(prev.set(userId, stream)));
        });

        // Enhanced join logic with proper subscription
        const joined = await joinStageWithRetry(stageId, user.id);
        if (!joined) {
          throw new Error('Failed to join real-time stage after all retry attempts');
        }

        // Initialize stage orchestrator with enhanced config
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
          },
          enableSecurity: true,
          enableCompliance: true
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to initialize stage');
        }

        toast.success('Connected to stage!', {
          description: 'All features are now active',
          duration: 3000
        });
      } catch (error) {
        console.error('Failed to initialize stage room:', error);
        
        const errorMessage = getErrorMessage(error);
        
        toast.error('Connection failed', {
          description: errorMessage,
          action: {
            label: 'Retry',
            onClick: () => initializeStageRoom()
          },
          duration: 5000
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

  const performCleanupWithRetry = async (stageId: string, userId: string, maxAttempts = 3) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Cleanup attempt ${attempt}/${maxAttempts}`);
        await StageCleanupService.forceCleanupUserParticipation(stageId, userId);
        
        // Wait longer between attempts
        const delay = Math.min(1000 * attempt, 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Cleanup attempt ${attempt} completed`);
        break;
      } catch (error) {
        console.warn(`Cleanup attempt ${attempt} failed:`, error);
        if (attempt === maxAttempts) {
          console.warn('All cleanup attempts failed, proceeding anyway...');
        }
      }
    }
  };

  const initializeMediaWithFallback = async (): Promise<MediaStream> => {
    try {
      // Try with full video/audio first
      return await WebRTCStageService.initializeMedia({
        audio: true,
        video: { width: 1280, height: 720, frameRate: 30 }
      });
    } catch (error) {
      console.warn('Failed to initialize with high quality, trying fallback:', error);
      
      try {
        // Fallback to basic video/audio
        return await WebRTCStageService.initializeMedia({
          audio: true,
          video: true
        });
      } catch (fallbackError) {
        console.warn('Failed to initialize with video, trying audio only:', fallbackError);
        
        // Final fallback to audio only
        return await WebRTCStageService.initializeMedia({
          audio: true,
          video: false
        });
      }
    }
  };

  const joinStageWithRetry = async (stageId: string, userId: string, maxRetries = 3): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Join attempt ${attempt}/${maxRetries}`);
        
        // Use the proper real-time service with fixed subscription timing
        const success = await RealTimeStageService.joinStage(stageId, userId, 'audience');
        if (success) {
          console.log(`Successfully joined on attempt ${attempt}`);
          return true;
        }
        
        throw new Error('Join returned false');
      } catch (error: any) {
        console.warn(`Join attempt ${attempt} failed:`, error);
        
        if (error?.message?.includes('duplicate key') && attempt < maxRetries) {
          console.log('Duplicate key detected, performing additional cleanup...');
          await performCleanupWithRetry(stageId, userId, 2);
          
          // Exponential backoff with jitter
          const baseDelay = 2000 * Math.pow(2, attempt - 1);
          const jitter = Math.random() * 1000;
          await new Promise(resolve => setTimeout(resolve, baseDelay + jitter));
        } else if (attempt >= maxRetries) {
          console.error('All join attempts failed');
          return false;
        }
      }
    }
    
    return false;
  };

  const getErrorMessage = (error: any): string => {
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        return 'Session conflict detected. The system will automatically retry with cleanup.';
      } else if (error.message.includes('Circuit breaker')) {
        return 'Service temporarily unavailable. Please try again in a few moments.';
      } else if (error.message.includes('Media access')) {
        return 'Camera/microphone access denied. Please check your browser permissions.';
      } else {
        return error.message;
      }
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const handleLeave = async () => {
    try {
      toast.info('Leaving stage...', { duration: 1000 });
      
      if (user) {
        await RealTimeStageService.leaveStage(user.id);
      }
      
      WebRTCStageService.cleanup();
      await leaveStage();
      
      // Clean up local state
      setLocalStream(null);
      setRemoteStreams(new Map());
      
      toast.success('Left the stage', { duration: 2000 });
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage, but you have been disconnected');
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
