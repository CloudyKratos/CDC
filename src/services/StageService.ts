
import { supabase } from "@/integrations/supabase/client";
import StageCleanupService from "./StageCleanupService";
import StageCoreService, { StageStatus } from "./stage/StageCoreService";
import StageParticipantService from "./stage/StageParticipantService";
import StageSpeakerService from "./stage/StageSpeakerService";
import StageSubscriptionService from "./stage/StageSubscriptionService";

export type StageRole = 'moderator' | 'speaker' | 'audience';
export type { StageStatus };

class StageService {
  private cleanupService = StageCleanupService;
  private coreService = StageCoreService;
  private participantService = StageParticipantService;
  private speakerService = StageSpeakerService;
  private subscriptionService = StageSubscriptionService;

  // Core stage operations
  async createStage(stageData: any) {
    try {
      console.log('Creating stage with data:', stageData);
      
      // Ensure we only send fields that exist in the database
      const cleanedStageData = {
        title: stageData.title,
        description: stageData.description || '',
        topic: stageData.topic || '',
        creator_id: stageData.creator_id,
        host_id: stageData.host_id,
        status: stageData.status || 'live',
        is_active: stageData.is_active !== false,
        max_speakers: stageData.max_speakers || 10,
        max_audience: stageData.max_audience || 100,
        actual_start_time: stageData.actual_start_time || new Date().toISOString(),
        allow_hand_raising: stageData.allow_hand_raising !== false,
        recording_enabled: stageData.recording_enabled || false
      };

      return this.coreService.createStage(cleanedStageData);
    } catch (error) {
      console.error('Error in createStage service:', error);
      throw error;
    }
  }

  async getActiveStages() {
    return this.coreService.getActiveStages();
  }

  async getStageById(stageId: string) {
    return this.coreService.getStageById(stageId);
  }

  async updateStageStatus(stageId: string, status: StageStatus) {
    return this.coreService.updateStageStatus(stageId, status);
  }

  async validateStageAccess(stageId: string) {
    return this.coreService.validateStageAccess(stageId);
  }

  // Participant operations
  async getStageParticipants(stageId: string) {
    return this.participantService.getStageParticipants(stageId);
  }

  async updateParticipantRole(stageId: string, userId: string, role: StageRole) {
    return this.participantService.updateParticipantRole(stageId, userId, role);
  }

  async toggleMute(stageId: string, userId: string, isMuted: boolean) {
    return this.participantService.toggleMute(stageId, userId, isMuted);
  }

  async raiseHand(stageId: string, isRaised: boolean) {
    return this.participantService.raiseHand(stageId, isRaised);
  }

  async leaveStage(stageId: string) {
    return this.participantService.leaveStage(stageId);
  }

  // Speaker request operations
  async getPendingSpeakerRequests(stageId: string) {
    return this.speakerService.getPendingSpeakerRequests(stageId);
  }

  async respondToSpeakerRequest(requestId: string, approved: boolean) {
    return this.speakerService.respondToSpeakerRequest(requestId, approved);
  }

  // Subscription operations
  subscribeToSpeakerRequests(stageId: string, callback: (payload: any) => void) {
    return this.speakerService.subscribeToSpeakerRequests(stageId, callback);
  }

  subscribeToStageUpdates(stageId: string, callback: (payload: any) => void) {
    return this.subscriptionService.subscribeToStageUpdates(stageId, callback);
  }

  subscribeToParticipants(stageId: string, callback: (payload: any) => void) {
    return this.subscriptionService.subscribeToParticipants(stageId, callback);
  }

  // Cleanup operations
  async forceDisconnectUser(stageId: string, userId: string) {
    return this.cleanupService.forceCleanupUserParticipation(stageId, userId);
  }

  async cleanupGhostParticipants(stageId: string) {
    try {
      await this.cleanupService.cleanupGhostParticipants(stageId);
      return true;
    } catch (error) {
      console.error('Error in cleanupGhostParticipants:', error);
      return false;
    }
  }

  async joinStage(stageId: string, role: StageRole = 'audience') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Authentication required. Please log in to join the stage.' };

      console.log('Attempting to join stage using safe method:', { stageId, userId: user.id, role });
      
      return await this.cleanupService.safeJoinStage(stageId, user.id, role);
      
    } catch (error) {
      console.error('Error joining stage:', error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Failed to join stage. Please check your connection and try again.' };
    }
  }
}

export default new StageService();
