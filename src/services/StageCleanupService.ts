
import { supabase } from '@/integrations/supabase/client';

class StageCleanupService {
  private static instance: StageCleanupService;

  static getInstance(): StageCleanupService {
    if (!StageCleanupService.instance) {
      StageCleanupService.instance = new StageCleanupService();
    }
    return StageCleanupService.instance;
  }

  async forceCleanupUserParticipation(stageId: string, userId: string): Promise<void> {
    try {
      console.log(`Force cleaning up user ${userId} from stage ${stageId}`);

      // Update any existing participant records to mark as left
      const { error: updateError } = await supabase
        .from('stage_participants')
        .update({ 
          left_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stage_id', stageId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (updateError) {
        console.warn('Error updating participant records:', updateError);
      }

      // Clean up any orphaned records
      const { error: deleteError } = await supabase
        .from('stage_participants')
        .delete()
        .eq('stage_id', stageId)
        .eq('user_id', userId)
        .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()); // Older than 5 minutes

      if (deleteError) {
        console.warn('Error deleting orphaned records:', deleteError);
      }

      // Clean up speaker requests
      const { error: requestError } = await supabase
        .from('speaker_requests')
        .delete()
        .eq('stage_id', stageId)
        .eq('user_id', userId);

      if (requestError) {
        console.warn('Error cleaning up speaker requests:', requestError);
      }

      console.log('Cleanup completed successfully');
    } catch (error) {
      console.error('Force cleanup failed:', error);
      throw error;
    }
  }

  async cleanupStage(stageId: string): Promise<void> {
    try {
      console.log(`Cleaning up stage ${stageId}`);

      // Mark all participants as left
      await supabase
        .from('stage_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('stage_id', stageId)
        .is('left_at', null);

      // Clean up speaker requests
      await supabase
        .from('speaker_requests')
        .delete()
        .eq('stage_id', stageId);

      // Update stage status
      await supabase
        .from('stages')
        .update({ 
          status: 'ended',
          end_time: new Date().toISOString()
        })
        .eq('id', stageId);

      console.log('Stage cleanup completed');
    } catch (error) {
      console.error('Stage cleanup failed:', error);
      throw error;
    }
  }

  async cleanupExpiredStages(): Promise<void> {
    try {
      // Find stages that have been running for more than 8 hours
      const { data: expiredStages } = await supabase
        .from('stages')
        .select('id')
        .eq('status', 'live')
        .lt('actual_start_time', new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString());

      if (expiredStages) {
        for (const stage of expiredStages) {
          await this.cleanupStage(stage.id);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup expired stages:', error);
    }
  }

  async cleanupGhostParticipants(stageId: string): Promise<void> {
    try {
      console.log(`Cleaning up ghost participants for stage ${stageId}`);
      
      // Remove participants who joined more than 10 minutes ago but never updated
      const { error } = await supabase
        .from('stage_participants')
        .delete()
        .eq('stage_id', stageId)
        .is('left_at', null)
        .lt('joined_at', new Date(Date.now() - 10 * 60 * 1000).toISOString());

      if (error) {
        console.warn('Error cleaning up ghost participants:', error);
      }
    } catch (error) {
      console.error('Ghost participant cleanup failed:', error);
    }
  }

  async safeJoinStage(stageId: string, userId: string, role: 'speaker' | 'audience' | 'moderator'): Promise<{ success: boolean; error?: string }> {
    try {
      // First cleanup any existing participation
      await this.forceCleanupUserParticipation(stageId, userId);
      
      // Wait a moment for cleanup to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Insert new participation record
      const { error } = await supabase
        .from('stage_participants')
        .insert({
          stage_id: stageId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Safe join failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Join failed' 
      };
    }
  }

  async cleanupCompletedStages(): Promise<void> {
    try {
      console.log('Cleaning up completed stages');
      
      // Find stages that ended more than 1 hour ago
      const { data: completedStages } = await supabase
        .from('stages')
        .select('id')
        .eq('status', 'ended')
        .lt('end_time', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      if (completedStages) {
        for (const stage of completedStages) {
          // Clean up any remaining participants
          await supabase
            .from('stage_participants')
            .update({ left_at: new Date().toISOString() })
            .eq('stage_id', stage.id)
            .is('left_at', null);
        }
      }
    } catch (error) {
      console.error('Completed stage cleanup failed:', error);
    }
  }
}

export default StageCleanupService.getInstance();
