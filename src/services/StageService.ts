
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Stage = Database['public']['Tables']['stages']['Row'];
type StageInsert = Database['public']['Tables']['stages']['Insert'];

export type StageStatus = 'scheduled' | 'live' | 'ended';
export type StageRole = 'moderator' | 'speaker' | 'audience';

class StageService {
  async createStage(stageData: Omit<StageInsert, 'creator_id'>): Promise<Stage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('stages')
        .insert([{
          ...stageData,
          creator_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      return null;
    }
  }

  async getActiveStages(): Promise<Stage[]> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching active stages:', error);
      return [];
    }
  }

  async getStageById(stageId: string): Promise<Stage | null> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching stage:', error);
      return null;
    }
  }

  async updateStageStatus(stageId: string, status: StageStatus): Promise<boolean> {
    try {
      const updates: any = { status };
      
      if (status === 'live') {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'ended') {
        updates.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', stageId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating stage status:', error);
      return false;
    }
  }

  async joinStage(stageId: string, role: StageRole = 'audience'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: existingParticipant } = await supabase
        .from('stage_participants')
        .select('id, left_at')
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingParticipant) {
        if (!existingParticipant.left_at) {
          console.log('User already participating in stage');
          return true;
        } else {
          const { error } = await supabase
            .from('stage_participants')
            .update({ 
              left_at: null, 
              role: role as Database['public']['Enums']['stage_role'],
              is_muted: role === 'audience',
              joined_at: new Date().toISOString()
            })
            .eq('id', existingParticipant.id);

          if (error) throw error;
          return true;
        }
      }

      const { error } = await supabase
        .from('stage_participants')
        .insert({
          stage_id: stageId,
          user_id: user.id,
          role: role as Database['public']['Enums']['stage_role'],
          is_muted: role === 'audience'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error joining stage:', error);
      return false;
    }
  }

  async leaveStage(stageId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('stage_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .is('left_at', null);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error leaving stage:', error);
      return false;
    }
  }

  async getStageParticipants(stageId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('stage_participants')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url,
            username
          )
        `)
        .eq('stage_id', stageId)
        .is('left_at', null)
        .order('joined_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stage participants:', error);
      return [];
    }
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

  subscribeToStageUpdates(stageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`stage-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stages',
          filter: `id=eq.${stageId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToParticipants(stageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`participants-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_participants',
          filter: `stage_id=eq.${stageId}`
        },
        callback
      )
      .subscribe();
  }
}

export default new StageService();
