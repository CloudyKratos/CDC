
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type StageRole = 'moderator' | 'speaker' | 'audience';

class StageParticipantService {
  private retryDelay = 1000;
  private maxRetries = 3;

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Operation failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  async getStageParticipants(stageId: string): Promise<any[]> {
    return this.retryOperation(async () => {
      console.log('Loading stage participants for:', stageId);
      
      const { data, error } = await supabase
        .from('stage_participants')
        .select(`
          id,
          stage_id,
          user_id,
          role,
          joined_at,
          left_at,
          is_muted,
          is_video_enabled,
          is_hand_raised,
          profiles!fk_stage_participants_user_id (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('stage_id', stageId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error loading participants:', error);
        throw new Error(`Failed to load participants: ${error.message}`);
      }
      
      console.log('Participants loaded:', data);
      return data || [];
    });
  }

  async updateParticipantRole(stageId: string, userId: string, role: StageRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stage_participants')
        .update({ 
          role: role as Database['public']['Enums']['stage_role'],
          is_muted: role === 'audience'
        })
        .eq('stage_id', stageId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating participant role:', error);
      return false;
    }
  }

  async toggleMute(stageId: string, userId: string, isMuted: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('stage_participants')
        .update({ is_muted: isMuted })
        .eq('stage_id', stageId)
        .eq('user_id', userId)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error toggling mute:', error);
      return false;
    }
  }

  async raiseHand(stageId: string, isRaised: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('stage_participants')
        .update({ is_hand_raised: isRaised })
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error raising hand:', error);
      return false;
    }
  }

  async leaveStage(stageId: string): Promise<boolean> {
    return this.retryOperation(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log('Leaving stage:', { stageId, userId: user.id });

      const { error } = await supabase
        .from('stage_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) {
        console.error('Error leaving stage:', error);
        throw error;
      }
      
      console.log('Successfully left stage');
      return true;
    });
  }
}

export default new StageParticipantService();
