
import { supabase } from "@/integrations/supabase/client";
import StageService from "./StageService";
import { StageStatus } from "./stage/StageCoreService";

export interface CommunityCall {
  id: string;
  title: string;
  description?: string;
  host_id: string;
  stage_id: string;
  scheduled_time: string;
  duration_minutes: number;
  max_participants: number;
  is_public: boolean;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  created_at: string;
  updated_at: string;
  participant_count?: number;
  host_name?: string;
}

export interface CallParticipant {
  id: string;
  call_id: string;
  user_id: string;
  role: 'host' | 'moderator' | 'speaker' | 'audience';
  joined_at: string;
  left_at?: string;
}

class CommunityCallService {
  async createCommunityCall(callData: {
    title: string;
    description?: string;
    scheduled_time: string;
    duration_minutes: number;
    max_participants?: number;
    is_public?: boolean;
  }): Promise<{ success: boolean; call?: CommunityCall; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Only allow specific user to create calls
      const AUTHORIZED_CREATOR_ID = '348ae8de-aaac-41cb-89cd-674023098784';
      if (user.id !== AUTHORIZED_CREATOR_ID) {
        return { success: false, error: 'Only authorized users can create community calls' };
      }

      // Create the stage first
      const stageResult = await StageService.createStage({
        title: callData.title,
        description: callData.description || '',
        creator_id: user.id,
        host_id: user.id,
        status: 'scheduled' as StageStatus,
        is_active: false,
        max_participants: callData.max_participants || 100,
        actual_start_time: callData.scheduled_time,
        allow_hand_raising: true,
        recording_enabled: false
      });

      if (!stageResult) {
        return { success: false, error: 'Failed to create stage' };
      }

      // Create community call record
      const callRecord = {
        id: `call-${Date.now()}`,
        title: callData.title,
        description: callData.description,
        host_id: user.id,
        stage_id: stageResult.id,
        scheduled_time: callData.scheduled_time,
        duration_minutes: callData.duration_minutes,
        max_participants: callData.max_participants || 100,
        is_public: callData.is_public ?? true,
        status: 'scheduled' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        participant_count: 0,
        host_name: user.user_metadata?.full_name || user.email || 'Host'
      };

      console.log('Creating community call:', callRecord);
      return { success: true, call: callRecord as CommunityCall };

    } catch (error) {
      console.error('Error creating community call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create call' 
      };
    }
  }

  async getUpcomingCalls(): Promise<CommunityCall[]> {
    try {
      // Mock data for now - in real implementation, this would fetch from database
      const mockCalls: CommunityCall[] = [
        {
          id: 'call-1',
          title: 'Weekly Community Standup',
          description: 'Join us for our weekly community discussion',
          host_id: 'user-1',
          stage_id: 'stage-1',
          scheduled_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          max_participants: 100,
          is_public: true,
          status: 'scheduled',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          participant_count: 5,
          host_name: 'John Doe'
        }
      ];

      return mockCalls;
    } catch (error) {
      console.error('Error fetching upcoming calls:', error);
      return [];
    }
  }

  async createCall(callData: {
    title: string;
    description: string;
    scheduledTime: Date;
    maxParticipants: number;
    host_id: string;
    status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  }): Promise<CommunityCall> {
    const result = await this.createCommunityCall({
      title: callData.title,
      description: callData.description,
      scheduled_time: callData.scheduledTime.toISOString(),
      duration_minutes: 60,
      max_participants: callData.maxParticipants,
      is_public: true
    });

    if (result.success && result.call) {
      return result.call;
    }

    throw new Error(result.error || 'Failed to create call');
  }

  async updateCallStatus(callId: string, status: 'scheduled' | 'live' | 'ended' | 'cancelled'): Promise<void> {
    try {
      console.log('Updating call status:', { callId, status });
      // In real implementation, this would update the database
    } catch (error) {
      console.error('Error updating call status:', error);
      throw error;
    }
  }

  async startCall(callId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      console.log('Starting community call:', callId);
      return { success: true };

    } catch (error) {
      console.error('Error starting call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to start call' 
      };
    }
  }

  async endCall(callId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Only allow authorized user to end calls
      const AUTHORIZED_CREATOR_ID = '348ae8de-aaac-41cb-89cd-674023098784';
      if (user.id !== AUTHORIZED_CREATOR_ID) {
        return { success: false, error: 'Only authorized users can end community calls' };
      }

      console.log('Ending community call and clearing from stage rooms:', callId);
      
      // Clear the call from stage rooms by updating status to ended
      await this.updateCallStatus(callId, 'ended');
      
      return { success: true };

    } catch (error) {
      console.error('Error ending call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to end call' 
      };
    }
  }

  // Check if user can create calls
  async canCreateCalls(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      const AUTHORIZED_CREATOR_ID = '348ae8de-aaac-41cb-89cd-674023098784';
      return user.id === AUTHORIZED_CREATOR_ID;
    } catch (error) {
      console.error('Error checking call creation permissions:', error);
      return false;
    }
  }

  async joinCall(callId: string, userId: string): Promise<{ success: boolean; stageId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      console.log('Joining community call:', { callId, userId });
      
      // Return mock stage ID for now
      return { success: true, stageId: `stage-${callId}` };

    } catch (error) {
      console.error('Error joining call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to join call' 
      };
    }
  }
}

export default new CommunityCallService();
