
import { supabase } from "@/integrations/supabase/client";
import { StageParticipant, StageParticipantInsert, StageRole } from "@/types/supabase-extended";

class StageParticipantService {
  async getStageParticipants(stageId: string): Promise<StageParticipant[]> {
    console.log('Fetching participants for stage:', stageId);
    
    const { data, error } = await supabase
      .from('stage_participants')
      .select('*')
      .eq('stage_id', stageId)
      .is('left_at', null)
      .order('joined_at', { ascending: true });

    if (error) {
      console.error('Error fetching stage participants:', error);
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }

    return (data || []) as StageParticipant[];
  }

  async updateParticipantRole(stageId: string, userId: string, role: StageRole): Promise<boolean> {
    console.log('Updating participant role:', { stageId, userId, role });
    
    const { error } = await supabase
      .from('stage_participants')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('stage_id', stageId)
      .eq('user_id', userId)
      .is('left_at', null);

    if (error) {
      console.error('Error updating participant role:', error);
      throw new Error(`Failed to update participant role: ${error.message}`);
    }

    return true;
  }

  async toggleMute(stageId: string, userId: string, isMuted: boolean): Promise<boolean> {
    console.log('Toggling mute for participant:', { stageId, userId, isMuted });
    
    const { error } = await supabase
      .from('stage_participants')
      .update({ is_muted: isMuted, updated_at: new Date().toISOString() })
      .eq('stage_id', stageId)
      .eq('user_id', userId)
      .is('left_at', null);

    if (error) {
      console.error('Error toggling mute:', error);
      throw new Error(`Failed to toggle mute: ${error.message}`);
    }

    return true;
  }

  async raiseHand(stageId: string, isRaised: boolean): Promise<boolean> {
    console.log('Raising/lowering hand:', { stageId, isRaised });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await supabase
      .from('stage_participants')
      .update({ is_hand_raised: isRaised, updated_at: new Date().toISOString() })
      .eq('stage_id', stageId)
      .eq('user_id', user.id)
      .is('left_at', null);

    if (error) {
      console.error('Error raising/lowering hand:', error);
      throw new Error(`Failed to update hand status: ${error.message}`);
    }

    return true;
  }

  async leaveStage(stageId: string): Promise<boolean> {
    console.log('User leaving stage:', stageId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const { error } = await supabase
      .from('stage_participants')
      .update({ 
        left_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stage_id', stageId)
      .eq('user_id', user.id)
      .is('left_at', null);

    if (error) {
      console.error('Error leaving stage:', error);
      throw new Error(`Failed to leave stage: ${error.message}`);
    }

    return true;
  }

  async joinStage(stageId: string, role: StageRole = 'audience'): Promise<StageParticipant> {
    console.log('User joining stage:', { stageId, role });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const participantData: StageParticipantInsert = {
      stage_id: stageId,
      user_id: user.id,
      role,
      is_muted: role === 'audience', // Audience starts muted
      is_video_enabled: false,
      is_hand_raised: false
    };

    const { data, error } = await supabase
      .from('stage_participants')
      .insert(participantData)
      .select()
      .single();

    if (error) {
      console.error('Error joining stage:', error);
      throw new Error(`Failed to join stage: ${error.message}`);
    }

    return data as StageParticipant;
  }
}

export default new StageParticipantService();
