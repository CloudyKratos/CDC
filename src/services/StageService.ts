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

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Stage not found. The stage may have been deleted or the link is incorrect.');
        }
        throw new Error(`Failed to load stage: ${error.message}`);
      }
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

  async forceDisconnectUser(stageId: string, userId: string): Promise<boolean> {
    try {
      console.log('Force disconnecting user from stage:', { stageId, userId });
      
      // Update all active participations for this user in this stage
      const { error } = await supabase
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

      if (error) {
        console.error('Error force disconnecting user:', error);
        return false;
      }

      console.log('User force disconnected successfully');
      return true;
    } catch (error) {
      console.error('Error in forceDisconnectUser:', error);
      return false;
    }
  }

  async cleanupGhostParticipants(stageId: string): Promise<boolean> {
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
        return false;
      }

      console.log('Ghost participants cleanup completed');
      return true;
    } catch (error) {
      console.error('Error in cleanupGhostParticipants:', error);
      return false;
    }
  }

  async validateStageAccess(stageId: string): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canAccess: false, reason: 'Authentication required. Please log in to access the stage.' };

      // Check if stage exists and is accessible
      const stage = await this.getStageById(stageId);
      if (!stage) return { canAccess: false, reason: 'Stage not found. The stage may have been deleted or moved.' };
      
      if (stage.status === 'ended') {
        return { canAccess: false, reason: 'This stage has already ended. Check for recordings or upcoming sessions.' };
      }

      return { canAccess: true };
    } catch (error) {
      console.error('Error validating stage access:', error);
      if (error instanceof Error) {
        return { canAccess: false, reason: error.message };
      }
      return { canAccess: false, reason: 'Unable to validate stage access. Please check your connection and try again.' };
    }
  }

  async joinStage(stageId: string, role: StageRole = 'audience'): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Authentication required. Please log in to join the stage.' };

      console.log('Attempting to join stage:', { stageId, userId: user.id, role });
      
      // Check for existing active participation first
      const { data: existing } = await supabase
        .from('stage_participants')
        .select('id')
        .eq('stage_id', stageId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (existing) {
        console.log('User already has active participation');
        return { success: true };
      }

      // Insert new participation record
      const { error: insertError } = await supabase
        .from('stage_participants')
        .insert({
          stage_id: stageId,
          user_id: user.id,
          role: role as Database['public']['Enums']['stage_role'],
          is_muted: role === 'audience',
          is_video_enabled: false,
          is_hand_raised: false,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error joining stage:', insertError);
        
        // Handle duplicate key error specifically
        if (insertError.code === '23505') {
          console.log('Duplicate participation detected, checking existing record');
          const { data: existingRecord } = await supabase
            .from('stage_participants')
            .select('id')
            .eq('stage_id', stageId)
            .eq('user_id', user.id)
            .is('left_at', null)
            .single();
            
          if (existingRecord) {
            return { success: true };
          }
        }
        
        throw new Error(`Failed to join stage: ${insertError.message}`);
      }
      
      console.log('Successfully joined stage');
      return { success: true };
      
    } catch (error) {
      console.error('Error joining stage:', error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to join stage. Please check your connection and try again.' };
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
