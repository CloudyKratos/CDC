
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import StageRoom from '@/components/stage-call/StageRoom';
import StageDetails from './components/StageDetails';
import StageError from './components/StageError';
import StageLoading from './components/StageLoading';
import { ExtendedStage } from '@/types/supabase-extended';
import { toast } from 'sonner';

interface ActiveStageProps {
  stageId: string;
  onLeave: () => void;
  userRole?: string;
}

const ActiveStage: React.FC<ActiveStageProps> = ({
  stageId,
  onLeave,
  userRole
}) => {
  const [stage, setStage] = useState<ExtendedStage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const { user } = useAuth();
  const { currentRole } = useRole();

  const loadStage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Loading stage:', stageId);
      const stageData = await StageService.getStageById(stageId);
      
      if (!stageData) {
        setError('Stage not found');
        return;
      }
      
      setStage(stageData);
      console.log('Stage loaded successfully:', stageData);
    } catch (error) {
      console.error('Error loading stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load stage details';
      setError(errorMessage);
      
      // Retry logic for network issues
      if (retryCount < 3 && !errorMessage.includes('not found')) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadStage(), 2000 * (retryCount + 1));
        return;
      }
    } finally {
      setIsLoading(false);
    }
  }, [stageId, retryCount]);

  useEffect(() => {
    loadStage();
    
    const channel = StageService.subscribeToStageUpdates(stageId, handleStageUpdate);
    
    return () => {
      channel.unsubscribe();
    };
  }, [loadStage, stageId]);

  const handleStageUpdate = useCallback(() => {
    console.log('Stage update received, reloading...');
    loadStage();
  }, [loadStage]);

  const validateJoinRequest = useCallback(async (): Promise<{ canJoin: boolean; error?: string }> => {
    if (!user) {
      return { canJoin: false, error: 'Please log in to join the stage' };
    }

    if (!stage) {
      return { canJoin: false, error: 'Stage data not available' };
    }

    // Check stage status
    if (stage.status === 'ended') {
      return { canJoin: false, error: 'This stage has ended' };
    }

    // Additional validation through service
    const validation = await StageService.validateStageAccess(stageId);
    if (!validation.canAccess) {
      return { canJoin: false, error: validation.reason };
    }

    return { canJoin: true };
  }, [user, stage, stageId]);

  const joinStageCall = async () => {
    if (!user || !stage) {
      toast.error('Unable to join stage at this time');
      return;
    }

    setIsJoining(true);
    setError(null);
    
    try {
      // Validate join request
      const validation = await validateJoinRequest();
      if (!validation.canJoin) {
        setError(validation.error || 'Cannot join stage');
        toast.error(validation.error || 'Cannot join stage');
        return;
      }

      // Start the stage if it's scheduled and user has permission
      if (stage.status === 'scheduled' && 
          (stage.creator_id === user.id || currentRole === 'admin' || currentRole === 'moderator')) {
        console.log('Starting stage...');
        const statusUpdated = await StageService.updateStageStatus(stageId, 'live');
        if (statusUpdated) {
          setStage(prev => prev ? { ...prev, status: 'live' } : null);
          toast.success('Stage is now live!');
        } else {
          setError('Failed to start stage');
          toast.error('Failed to start stage');
          return;
        }
      }

      // Proceed to stage call with new component
      setHasJoined(true);
    } catch (error) {
      console.error('Error joining stage:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to join stage';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
    }
  };

  const leaveStageCall = async () => {
    try {
      console.log('Leaving stage...');
      setHasJoined(false);
      onLeave();
      toast.success('Left stage successfully!');
    } catch (error) {
      console.error('Error leaving stage:', error);
      setHasJoined(false);
      onLeave();
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    loadStage();
  };

  if (isLoading) {
    return <StageLoading onLeave={onLeave} />;
  }

  if (error || !stage) {
    return (
      <StageError 
        error={error} 
        onLeave={onLeave}
        onRetry={handleRetry}
      />
    );
  }

  if (hasJoined) {
    return <StageRoom stageId={stageId} onLeave={leaveStageCall} />;
  }

  return (
    <StageDetails
      stage={stage}
      user={user}
      currentRole={currentRole}
      isJoining={isJoining}
      error={error}
      onLeave={onLeave}
      onJoin={joinStageCall}
    />
  );
};

export default ActiveStage;
