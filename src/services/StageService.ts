
import { supabase } from '@/integrations/supabase/client';

interface Stage {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  is_active: boolean;
  max_participants: number;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

interface StageParticipant {
  id: string;
  stage_id: string;
  user_id: string;
  role: 'moderator' | 'speaker' | 'audience';
  joined_at: string;
  left_at?: string;
  is_muted: boolean;
  is_video_enabled: boolean;
  is_hand_raised: boolean;
  profiles?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

class StageService {
  async getActiveStages(): Promise<Stage[]> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stages:', error);
      throw error;
    }
  }

  async createStage(stageData: {
    name: string;
    description?: string;
    max_participants: number;
    is_active: boolean;
    host_id: string;
  }): Promise<Stage> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert(stageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  }

  async updateStage(id: string, updates: Partial<Stage>): Promise<Stage> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  }

  async deleteStage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  }

  async getStageParticipants(stageId: string): Promise<StageParticipant[]> {
    try {
      // Since we don't have stage_participants table, return mock data for now
      console.log('Loading participants for stage:', stageId);
      return [];
    } catch (error) {
      console.error('Error loading participants:', error);
      return [];
    }
  }

  async joinStage(stageId: string, role: 'moderator' | 'speaker' | 'audience' = 'audience'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Joining stage:', stageId, 'as', role);
      // Mock implementation since we don't have stage_participants table
      return { success: true };
    } catch (error) {
      console.error('Error joining stage:', error);
      return { success: false, error: 'Failed to join stage' };
    }
  }

  subscribeToParticipants(stageId: string, callback: () => void) {
    console.log('Subscribing to participants for stage:', stageId);
    // Mock subscription - return unsubscribe function
    return {
      unsubscribe: () => {
        console.log('Unsubscribing from participants');
      }
    };
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

  async toggleMute(stageId: string, userId: string, isMuted: boolean): Promise<boolean> {
    try {
      console.log('Toggling mute for user:', userId, 'in stage:', stageId, 'muted:', isMuted);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error toggling mute:', error);
      return false;
    }
  }

  async raiseHand(stageId: string, isRaised: boolean): Promise<boolean> {
    try {
      console.log('Raising hand in stage:', stageId, 'raised:', isRaised);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error raising hand:', error);
      return false;
    }
  }

  async leaveStage(stageId: string): Promise<boolean> {
    try {
      console.log('Leaving stage:', stageId);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error leaving stage:', error);
      return false;
    }
  }

  async validateStageAccess(stageId: string): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canAccess: false, reason: 'Authentication required' };

      const { data: stage, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (error || !stage) {
        return { canAccess: false, reason: 'Stage not found' };
      }

      return { canAccess: true };
    } catch (error) {
      console.error('Error validating stage access:', error);
      return { canAccess: false, reason: 'Unable to validate access' };
    }
  }
}

export default new StageService();
