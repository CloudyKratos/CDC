
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import RealTimeStageCall from './RealTimeStageCall';
import StageDetails from './components/StageDetails';
import StageError from './components/StageError';
import StageLoading from './components/StageLoading';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Stage = Database['public']['Tables']['stages']['Row'];

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
  const [stage, setStage] = useState<Stage | null>(null);
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
      setError('Failed to load stage details');
      
      // Retry logic for network issues
      if (retryCount < 3) {
        console.log(`Retrying... (${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => loadStage(), 2000);
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
    const validation = await StageService.validateStageJoin(stageId, 'audience');
    if (!validation.canJoin) {
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

      // Proceed to stage call (connection will be handled by RealTimeStageCall)
      setHasJoined(true);
    } catch (error) {
      console.error('Error joining stage:', error);
      setError('Failed to join stage');
      toast.error('Failed to join stage');
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
    return <RealTimeStageCall stageId={stageId} onLeave={leaveStageCall} />;
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
