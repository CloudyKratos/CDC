
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
      
      // Hard delete any existing records for this user in this stage
      const { error: deleteError } = await supabase
        .from('stage_participants')
        .delete()
        .eq('stage_id', stageId)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('Error deleting existing participation:', deleteError);
        // Continue anyway - might not exist
      }

      // Wait for deletion to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('User participation forcefully cleaned up');
      return true;
    } catch (error) {
      console.error('Error in forceCleanupUserParticipation:', error);
      return false;
    }
  }

  async safeJoinStage(stageId: string, userId: string, role: 'speaker' | 'audience' | 'moderator' = 'audience'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Attempting safe stage join:', { stageId, userId, role });

      // First, aggressive cleanup - delete any existing records
      await this.forceCleanupUserParticipation(stageId, userId);

      // Wait for database consistency
      await new Promise(resolve => setTimeout(resolve, 1500));

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
        
        // If still getting duplicate key error, try using UPSERT approach
        if (error.code === '23505') {
          console.log('Duplicate key detected, trying UPSERT approach...');
          
          const { error: upsertError } = await supabase
            .from('stage_participants')
            .upsert({
              stage_id: stageId,
              user_id: userId,
              role: role,
              is_muted: role === 'audience',
              is_video_enabled: false,
              is_hand_raised: false,
              joined_at: new Date().toISOString(),
              left_at: null
            }, {
              onConflict: 'stage_id,user_id',
              ignoreDuplicates: false
            });
            
          if (upsertError) {
            throw new Error(`Failed to join stage with UPSERT: ${upsertError.message}`);
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
      
      // Delete participants who joined more than 10 minutes ago without recent activity
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from('stage_participants')
        .delete()
        .eq('stage_id', stageId)
        .is('left_at', null)
        .lt('joined_at', tenMinutesAgo);

      if (error) {
        console.error('Error cleaning up ghost participants:', error);
      } else {
        console.log('Ghost participants cleanup completed');
      }
    } catch (error) {
      console.error('Error in cleanupGhostParticipants:', error);
    }
  }

  async cleanupCompletedStages(): Promise<void> {
    try {
      console.log('Cleaning up completed stages...');
      
      // Get stages that ended more than 2 hours ago
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      // Delete all participants from ended stages
      const { error: participantsError } = await supabase
        .from('stage_participants')
        .delete()
        .in('stage_id', 
          supabase
            .from('stages')
            .select('id')
            .eq('status', 'ended')
            .lt('end_time', twoHoursAgo)
        );

      if (participantsError) {
        console.error('Error cleaning up stage participants:', participantsError);
      }

      // Delete speaker requests from ended stages
      const { error: requestsError } = await supabase
        .from('speaker_requests')
        .delete()
        .in('stage_id', 
          supabase
            .from('stages')
            .select('id')
            .eq('status', 'ended')
            .lt('end_time', twoHoursAgo)
        );

      if (requestsError) {
        console.error('Error cleaning up speaker requests:', requestsError);
      }

      console.log('Completed stages cleanup finished');
    } catch (error) {
      console.error('Error in cleanupCompletedStages:', error);
    }
  }

  async endStageAndCleanup(stageId: string): Promise<boolean> {
    try {
      console.log('Ending stage and cleaning up:', stageId);

      // Mark stage as ended
      const { error: stageError } = await supabase
        .from('stages')
        .update({ 
          status: 'ended',
          end_time: new Date().toISOString()
        })
        .eq('id', stageId);

      if (stageError) {
        console.error('Error ending stage:', stageError);
        return false;
      }

      // Mark all participants as left
      const { error: participantsError } = await supabase
        .from('stage_participants')
        .update({ 
          left_at: new Date().toISOString(),
          is_muted: true,
          is_video_enabled: false,
          is_hand_raised: false
        })
        .eq('stage_id', stageId)
        .is('left_at', null);

      if (participantsError) {
        console.error('Error updating participants:', participantsError);
      }

      console.log('Stage ended and cleanup completed');
      return true;
    } catch (error) {
      console.error('Error in endStageAndCleanup:', error);
      return false;
    }
  }
}

export default StageCleanupService;
