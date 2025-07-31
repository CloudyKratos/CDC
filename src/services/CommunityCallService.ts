
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
        title: callData.title,
        description: callData.description,
        host_id: user.id,
        stage_id: stageResult.id,
        scheduled_time: callData.scheduled_time,
        duration_minutes: callData.duration_minutes,
        max_participants: callData.max_participants || 100,
        is_public: callData.is_public ?? true,
        status: 'scheduled' as const
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

  async startCall(callId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // Update stage status to live
      // In a real implementation, you'd update the call status in the database
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

      console.log('Ending community call:', callId);
      return { success: true };

    } catch (error) {
      console.error('Error ending call:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to end call' 
      };
    }
  }

  async joinCall(callId: string, role: 'speaker' | 'audience' = 'audience'): Promise<{ success: boolean; stageId?: string; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Authentication required' };
      }

      // In a real implementation, you'd fetch the call details and join the associated stage
      console.log('Joining community call:', { callId, userId: user.id, role });
      
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
