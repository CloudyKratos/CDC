
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
}

export default StageCleanupService.getInstance();
