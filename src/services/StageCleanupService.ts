
import { supabase } from "@/integrations/supabase/client";

class StageCleanupService {
  private static instance: StageCleanupService;

  static getInstance(): StageCleanupService {
    if (!StageCleanupService.instance) {
      StageCleanupService.instance = new StageCleanupService();
    }
    return StageCleanupService.instance;
  }

  async forceCleanupUserParticipation(stageId: string, userId: string): Promise<boolean> {
    try {
      console.log('Force cleaning up user participation:', { stageId, userId });
      
      // First, try to update any existing records to mark them as left
      const { error: updateError } = await supabase
        .from('stage_participants')
        .update({ 
          left_at: new Date().toISOString(),
          is_muted: true,
          is_video_enabled: false,
          is_hand_raised: false
        })
        .eq('stage_id', stageId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (updateError) {
        console.error('Error updating existing participation:', updateError);
      }

      // Wait a moment for the update to process
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('User participation cleaned up successfully');
      return true;
    } catch (error) {
      console.error('Error in forceCleanupUserParticipation:', error);
      return false;
    }
  }

  async safeJoinStage(stageId: string, userId: string, role: 'speaker' | 'audience' | 'moderator' = 'audience'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting safe stage join:', { stageId, userId, role });

      // First cleanup any existing participation
      await this.forceCleanupUserParticipation(stageId, userId);

      // Wait a bit more to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Now try to insert new participation
      const { data, error } = await supabase
        .from('stage_participants')
        .insert({
          stage_id: stageId,
          user_id: userId,
          role: role,
          is_muted: role === 'audience',
          is_video_enabled: false,
          is_hand_raised: false,
          joined_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting new participation:', error);
        
        // If still getting duplicate key error, try one more cleanup and retry
        if (error.code === '23505') {
          console.log('Duplicate key detected, trying one more cleanup...');
          await this.forceCleanupUserParticipation(stageId, userId);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Final retry
          const { error: retryError } = await supabase
            .from('stage_participants')
            .insert({
              stage_id: stageId,
              user_id: userId,
              role: role,
              is_muted: role === 'audience',
              is_video_enabled: false,
              is_hand_raised: false,
              joined_at: new Date().toISOString()
            });
            
          if (retryError) {
            throw new Error(`Failed to join stage after cleanup: ${retryError.message}`);
          }
        } else {
          throw new Error(`Failed to join stage: ${error.message}`);
        }
      }

      console.log('Successfully joined stage');
      return { success: true };
    } catch (error) {
      console.error('Error in safeJoinStage:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to join stage safely' 
      };
    }
  }

  async cleanupGhostParticipants(stageId: string): Promise<void> {
    try {
      console.log('Cleaning up ghost participants for stage:', stageId);
      
      // Mark participants as left if they joined more than 5 minutes ago without recent activity
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('stage_participants')
        .update({ 
          left_at: new Date().toISOString(),
          is_muted: true,
          is_video_enabled: false,
          is_hand_raised: false
        })
        .eq('stage_id', stageId)
        .is('left_at', null)
        .lt('joined_at', fiveMinutesAgo);

      if (error) {
        console.error('Error cleaning up ghost participants:', error);
      } else {
        console.log('Ghost participants cleanup completed');
      }
    } catch (error) {
      console.error('Error in cleanupGhostParticipants:', error);
    }
  }
}

export default StageCleanupService;
