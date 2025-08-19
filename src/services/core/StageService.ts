import { BrowserEventEmitter } from './BrowserEventEmitter';
import WebRTCStageService from '../WebRTCStageService';
import VideoConferenceService from '../conference/VideoConferenceService';

export interface StageParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'host' | 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  connectionState: RTCPeerConnectionState;
  networkQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  stream?: MediaStream;
}

export interface StageSettings {
  allowAudienceAudio: boolean;
  allowAudienceVideo: boolean;
  allowAudienceScreenShare: boolean;
  allowAudienceChat: boolean;
  isRecording: boolean;
  maxParticipants: number;
  moderationEnabled: boolean;
}

class StageService extends BrowserEventEmitter {
  private static instance: StageService;
  private participants: Map<string, StageParticipant> = new Map();
  private localParticipant: StageParticipant | null = null;
  private localStream: MediaStream | null = null;
  private currentStageId: string | null = null;
  private isInitialized = false;
  
  private stageSettings: StageSettings = {
    allowAudienceAudio: true,
    allowAudienceVideo: true,
    allowAudienceScreenShare: true,
    allowAudienceChat: true,
    isRecording: false,
    maxParticipants: 50,
    moderationEnabled: false
  };

  static getInstance(): StageService {
    if (!StageService.instance) {
      StageService.instance = new StageService();
    }
    return StageService.instance;
  }

  async joinStage(
    stageId: string,
    userId: string,
    name: string,
    role: 'host' | 'speaker' | 'audience' | 'moderator' = 'speaker'
  ): Promise<boolean> {
    try {
      this.currentStageId = stageId;
      console.log(`Joining stage ${stageId} as ${role}`);
      
      // Use VideoConferenceService for media handling
      const conferenceRole = this.mapStageRoleToConferenceRole(role);
      const success = await VideoConferenceService.joinConference(
        stageId,
        userId,
        name,
        conferenceRole
      );

      if (success) {
        this.isInitialized = true;
        
        // Create local participant
        this.localParticipant = {
          id: userId,
          name,
          role,
          isAudioEnabled: true,
          isVideoEnabled: true,
          isSpeaking: false,
          isHandRaised: false,
          isScreenSharing: false,
          joinedAt: new Date(),
          connectionState: 'connected',
          networkQuality: 'good'
        };

        this.participants.set(userId, this.localParticipant);
        
        // Forward events from VideoConferenceService
        this.setupVideoConferenceListeners();
        
        this.emit('stageJoined', { participant: this.localParticipant });
        this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      }

      return success;
    } catch (error) {
      console.error('Failed to join stage:', error);
      return false;
    }
  }

  private mapStageRoleToConferenceRole(stageRole: string): 'host' | 'presenter' | 'attendee' {
    switch (stageRole) {
      case 'host':
      case 'moderator':
        return 'host';
      case 'speaker':
        return 'presenter';
      case 'audience':
        return 'attendee';
      default:
        return 'presenter';
    }
  }

  private setupVideoConferenceListeners(): void {
    VideoConferenceService.on('localAudioToggled', (enabled: boolean) => {
      if (this.localParticipant) {
        this.localParticipant.isAudioEnabled = enabled;
        this.emit('audioToggled', { enabled });
      }
    });

    VideoConferenceService.on('localVideoToggled', (enabled: boolean) => {
      if (this.localParticipant) {
        this.localParticipant.isVideoEnabled = enabled;
        this.emit('videoToggled', { enabled });
      }
    });

    VideoConferenceService.on('handRaiseToggled', (isRaised: boolean) => {
      if (this.localParticipant) {
        this.localParticipant.isHandRaised = isRaised;
        this.emit('handRaiseToggled', { isRaised });
      }
    });

    VideoConferenceService.on('screenShareStarted', (stream: MediaStream) => {
      if (this.localParticipant) {
        this.localParticipant.isScreenSharing = true;
        this.emit('screenShareStarted', { stream });
      }
    });

    VideoConferenceService.on('screenShareStopped', () => {
      if (this.localParticipant) {
        this.localParticipant.isScreenSharing = false;
        this.emit('screenShareStopped');
      }
    });
  }

  async toggleAudio(): Promise<boolean> {
    try {
      return await VideoConferenceService.toggleAudio();
    } catch (error) {
      console.error('Error toggling audio:', error);
      throw error;
    }
  }

  async toggleVideo(): Promise<boolean> {
    try {
      return await VideoConferenceService.toggleVideo();
    } catch (error) {
      console.error('Error toggling video:', error);
      throw error;
    }
  }

  async toggleHandRaise(): Promise<boolean> {
    try {
      return await VideoConferenceService.toggleHandRaise();
    } catch (error) {
      console.error('Error toggling hand raise:', error);
      throw error;
    }
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      return await VideoConferenceService.startScreenShare();
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    try {
      await VideoConferenceService.stopScreenShare();
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  }

  async leaveStage(): Promise<void> {
    try {
      await VideoConferenceService.leaveConference();
      
      this.participants.clear();
      this.localParticipant = null;
      this.isInitialized = false;
      this.currentStageId = null;
      
      this.emit('stageLeft');
    } catch (error) {
      console.error('Error leaving stage:', error);
    }
  }

  getParticipants(): StageParticipant[] {
    return Array.from(this.participants.values());
  }

  getLocalParticipant(): StageParticipant | null {
    return this.localParticipant;
  }

  getCurrentStageId(): string | null {
    return this.currentStageId;
  }

  getStageSettings(): StageSettings {
    return { ...this.stageSettings };
  }

  async updateStageSettings(settings: Partial<StageSettings>): Promise<void> {
    if (!this.localParticipant || 
        (this.localParticipant.role !== 'host' && this.localParticipant.role !== 'moderator')) {
      throw new Error('Only hosts and moderators can update stage settings');
    }
    
    this.stageSettings = { ...this.stageSettings, ...settings };
    this.emit('stageSettingsUpdated', this.stageSettings);
  }

  isConnected(): boolean {
    return this.isInitialized && this.localParticipant !== null;
  }

  getConferenceStats() {
    return VideoConferenceService.getConferenceStats();
  }
}

export default StageService.getInstance();