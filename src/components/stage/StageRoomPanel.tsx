
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService, { StageRole } from '@/services/StageService';
import StageList from './StageList';
import ActiveStage from './ActiveStage';
import CreateStageModal from './CreateStageModal';
import { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Plus, Mic } from 'lucide-react';
import { toast } from 'sonner';

type Stage = Database['public']['Tables']['stages']['Row'];

const StageRoomPanel: React.FC = () => {
  const [activeStages, setActiveStages] = useState<Stage[]>([]);
  const [currentStageId, setCurrentStageId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const { currentRole } = useRole();

  const canCreateStage = currentRole === 'admin' || currentRole === 'moderator';

  useEffect(() => {
    loadActiveStages();
    
    // Set up real-time subscription for stage updates
    const handleStageUpdates = () => {
      loadActiveStages();
    };

    // Subscribe to general stage updates
    const channel = StageService.subscribeToStageUpdates('*', handleStageUpdates);

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const loadActiveStages = async () => {
    setIsLoading(true);
    try {
      const stages = await StageService.getActiveStages();
      setActiveStages(stages);
    } catch (error) {
      console.error('Error loading stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStage = async (stageData: any) => {
    try {
      const newStage = await StageService.createStage({
        title: stageData.title,
        description: stageData.description,
        topic: stageData.topic,
        scheduled_start_time: stageData.scheduledStartTime?.toISOString(),
        max_speakers: stageData.maxSpeakers || 10,
        max_audience: stageData.maxAudience || 100,
        allow_hand_raising: stageData.allowHandRaising ?? true,
        recording_enabled: stageData.recordingEnabled ?? false
      });

      if (newStage) {
        toast.success('Stage created successfully!');
        setShowCreateModal(false);
        
        // If the stage should start immediately, update status and join
        if (stageData.startImmediately) {
          await StageService.updateStageStatus(newStage.id, 'live');
          await handleJoinStage(newStage.id);
        } else {
          loadActiveStages();
        }
      } else {
        toast.error('Failed to create stage');
      }
    } catch (error) {
      console.error('Error creating stage:', error);
      toast.error('Failed to create stage');
    }
  };

  const handleJoinStage = async (stageId: string) => {
    if (!user) {
      toast.error('Please log in to join a stage');
      return;
    }

    try {
      const success = await StageService.joinStage(stageId, 'audience');
      if (success) {
        setCurrentStageId(stageId);
        toast.success('Joined stage successfully!');
      } else {
        toast.error('Failed to join stage');
      }
    } catch (error) {
      console.error('Error joining stage:', error);
      toast.error('Failed to join stage');
    }
  };

  const handleLeaveStage = async () => {
    if (!currentStageId) return;

    try {
      const success = await StageService.leaveStage(currentStageId);
      if (success) {
        setCurrentStageId(null);
        loadActiveStages(); // Refresh the list
        toast.success('Left stage successfully!');
      } else {
        toast.error('Failed to leave stage');
      }
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Failed to leave stage');
    }
  };

  if (currentStageId) {
    return (
      <ActiveStage
        stageId={currentStageId}
        onLeave={handleLeaveStage}
        userRole={currentRole}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">Stage Rooms</h1>
          <span className="text-sm text-muted-foreground">
            ({activeStages.length} active)
          </span>
        </div>
        
        {canCreateStage && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Stage
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <StageList
          stages={activeStages}
          onJoinStage={handleJoinStage}
          isLoading={isLoading}
          canCreateStage={canCreateStage}
          onCreateStage={() => setShowCreateModal(true)}
        />
      </div>

      {/* Create Stage Modal */}
      <CreateStageModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateStage={handleCreateStage}
      />
    </div>
  );
};

export default StageRoomPanel;
