import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Stage = Database['public']['Tables']['stages']['Row'];
type StageInsert = Database['public']['Tables']['stages']['Insert'];
type SpeakerRequest = Database['public']['Tables']['speaker_requests']['Row'];

export type StageStatus = 'scheduled' | 'live' | 'ended';
export type StageRole = 'moderator' | 'speaker' | 'audience';

class StageService {
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

  async createStage(stageData: Omit<StageInsert, 'creator_id'>): Promise<Stage | null> {
    return this.retryOperation(async () => {
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
    });
  }

  async getActiveStages(): Promise<Stage[]> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  async getStageById(stageId: string): Promise<Stage | null> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (error) throw error;
      return data;
    });
  }

  async updateStageStatus(stageId: string, status: StageStatus): Promise<boolean> {
    return this.retryOperation(async () => {
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
    });
  }

  async validateStageJoin(stageId: string, role: StageRole = 'audience'): Promise<{ canJoin: boolean; reason?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canJoin: false, reason: 'User not authenticated' };

      // Check if stage exists and is joinable
      const stage = await this.getStageById(stageId);
      if (!stage) return { canJoin: false, reason: 'Stage not found' };
      
      if (stage.status === 'ended') return { canJoin: false, reason: 'Stage has ended' };

      // Check participant limits
      const participants = await this.getStageParticipants(stageId);
      const speakers = participants.filter(p => ['speaker', 'moderator'].includes(p.role));
      const audience = participants.filter(p => p.role === 'audience');

      if (role === 'speaker' && speakers.length >= (stage.max_speakers || 10)) {
        return { canJoin: false, reason: 'Speaker limit reached' };
      }

      if (role === 'audience' && audience.length >= (stage.max_audience || 100)) {
        return { canJoin: false, reason: 'Audience limit reached' };
      }

      return { canJoin: true };
    } catch (error) {
      console.error('Error validating stage join:', error);
      return { canJoin: false, reason: 'Validation failed' };
    }
  }

  async joinStage(stageId: string, role: StageRole = 'audience'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'User not authenticated' };

      // Validate join request
      const validation = await this.validateStageJoin(stageId, role);
      if (!validation.canJoin) {
        return { success: false, error: validation.reason };
      }

      return this.retryOperation(async () => {
        const { data: existingParticipant } = await supabase
          .from('stage_participants')
          .select('id, left_at')
          .eq('stage_id', stageId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingParticipant) {
          if (!existingParticipant.left_at) {
            return { success: true }; // Already joined
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
            return { success: true };
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
        return { success: true };
      });
    } catch (error) {
      console.error('Error joining stage:', error);
      return { success: false, error: 'Failed to join stage' };
    }
  }

  async leaveStage(stageId: string): Promise<boolean> {
    return this.retryOperation(async () => {
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
    });
  }

  async getStageParticipants(stageId: string): Promise<any[]> {
    return this.retryOperation(async () => {
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

  // Speaker request methods
  async getPendingSpeakerRequests(stageId: string): Promise<SpeakerRequest[]> {
    try {
      const { data, error } = await supabase
        .from('speaker_requests')
        .select('*')
        .eq('stage_id', stageId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching speaker requests:', error);
      return [];
    }
  }

  async respondToSpeakerRequest(requestId: string, approved: boolean): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const status = approved ? 'approved' : 'denied';
      
      const { error } = await supabase
        .from('speaker_requests')
        .update({ 
          status: status as Database['public']['Enums']['speaker_request_status'],
          responded_at: new Date().toISOString(),
          responded_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error responding to speaker request:', error);
      return false;
    }
  }

  subscribeToSpeakerRequests(stageId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`speaker-requests-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speaker_requests',
          filter: `stage_id=eq.${stageId}`
        },
        callback
      )
      .subscribe();
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
    const channel = supabase
      .channel(`participants-${stageId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_participants',
          filter: `stage_id=eq.${stageId}`
        },
        (payload) => {
          console.log('Participant change:', payload);
          callback(payload);
        }
      )
      .subscribe((status) => {
        console.log('Participant subscription status:', status);
      });

    return {
      unsubscribe: () => {
        console.log('Unsubscribing from participants channel');
        supabase.removeChannel(channel);
      }
    };
  }
}

export default new StageService();
