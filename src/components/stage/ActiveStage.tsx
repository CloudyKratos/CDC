
import React, { useState, useEffect } from 'react';
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

  const { user } = useAuth();
  const { currentRole } = useRole();

  useEffect(() => {
    loadStage();
    
    const channel = StageService.subscribeToStageUpdates(stageId, handleStageUpdate);
    
    return () => {
      channel.unsubscribe();
    };
  }, [stageId]);

  const loadStage = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stageData = await StageService.getStageById(stageId);
      if (!stageData) {
        setError('Stage not found');
        return;
      }
      setStage(stageData);
    } catch (error) {
      console.error('Error loading stage:', error);
      setError('Failed to load stage details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageUpdate = () => {
    loadStage();
  };

  const joinStageCall = async () => {
    if (!user || !stage) {
      toast.error('Please log in to join the stage');
      return;
    }

    setIsJoining(true);
    setError(null);
    
    try {
      if (stage.status === 'scheduled' && 
          (stage.creator_id === user.id || currentRole === 'admin' || currentRole === 'moderator')) {
        const statusUpdated = await StageService.updateStageStatus(stageId, 'live');
        if (statusUpdated) {
          setStage(prev => prev ? { ...prev, status: 'live' } : null);
          toast.success('Stage is now live!');
        }
      }

      const success = await StageService.joinStage(stageId, 'audience');
      if (success) {
        setHasJoined(true);
        toast.success('Joined stage successfully!');
      } else {
        setError('Failed to join stage');
        toast.error('Failed to join stage');
      }
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
      const success = await StageService.leaveStage(stageId);
      if (success) {
        setHasJoined(false);
        onLeave();
        toast.success('Left stage successfully!');
      } else {
        toast.error('Failed to leave stage');
      }
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Failed to leave stage');
    }
  };

  if (isLoading) {
    return <StageLoading onLeave={onLeave} />;
  }

  if (error || !stage) {
    return <StageError error={error} onLeave={onLeave} />;
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
