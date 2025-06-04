
import { StageMediaService } from '../StageMediaService';
import StageSignalingService from '../StageSignalingService';
import EnhancedStageWebRTCService from '../EnhancedStageWebRTCService';
import StageConnectionManager from '../StageConnectionManager';

export interface StageConfig {
  stageId: string;
  userId: string;
  userRole: 'speaker' | 'audience' | 'moderator';
  mediaConstraints?: {
    audio: boolean;
    video: boolean;
    preferredAudioDeviceId?: string;
    preferredVideoDeviceId?: string;
  };
  qualitySettings?: {
    maxBitrate: number;
    adaptiveStreaming: boolean;
    lowLatencyMode: boolean;
  };
}

export interface StageState {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
  participantCount: number;
  mediaState: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    devices: {
      audio: MediaDeviceInfo[];
      video: MediaDeviceInfo[];
    };
  };
  networkQuality: {
    ping: number;
    bandwidth: number;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  errors: string[];
}

export class StageOrchestrator {
  private static instance: StageOrchestrator;
  private currentStage: StageConfig | null = null;
  private state: StageState = {
    connectionState: 'disconnected',
    participantCount: 0,
    mediaState: {
      audioEnabled: false,
      videoEnabled: false,
      devices: { audio: [], video: [] }
    },
    networkQuality: {
      ping: 0,
      bandwidth: 0,
      quality: 'good'
    },
    errors: []
  };
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): StageOrchestrator {
    if (!StageOrchestrator.instance) {
      StageOrchestrator.instance = new StageOrchestrator();
    }
    return StageOrchestrator.instance;
  }

  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('StageOrchestrator: Initializing stage with config:', config);
      
      this.currentStage = config;
      this.updateState({ connectionState: 'connecting' });

      // Step 1: Initialize media services
      const mediaService = StageMediaService.getInstance();
      await mediaService.updateDeviceList();
      
      const devices = {
        audio: mediaService.getAudioDevices(),
        video: mediaService.getVideoDevices()
      };
      
      this.updateState({
        mediaState: { ...this.state.mediaState, devices }
      });

      // Step 2: Initialize media stream
      const localStream = await mediaService.initializeMedia(config.mediaConstraints);
      
      this.updateState({
        mediaState: {
          ...this.state.mediaState,
          audioEnabled: !localStream.getAudioTracks()[0]?.enabled === false,
          videoEnabled: !localStream.getVideoTracks()[0]?.enabled === false
        }
      });

      // Step 3: Setup connection monitoring
      this.setupConnectionMonitoring();

      // Step 4: Connect to stage
      const connectionResult = await StageConnectionManager.connectToStage(
        config.stageId,
        config.userId
      );

      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Failed to connect to stage');
      }

      this.updateState({ 
        connectionState: 'connected',
        errors: []
      });

      this.emit('stageInitialized', { config, state: this.state });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateState({ 
        connectionState: 'error',
        errors: [...this.state.errors, errorMessage]
      });
      
      console.error('StageOrchestrator: Failed to initialize stage:', error);
      this.emit('stageError', { error: errorMessage });
      
      return { success: false, error: errorMessage };
    }
  }

  async leaveStage(): Promise<void> {
    try {
      console.log('StageOrchestrator: Leaving stage');
      
      if (this.currentStage) {
        await StageConnectionManager.disconnectFromStage();
      }

      this.updateState({
        connectionState: 'disconnected',
        participantCount: 0,
        errors: []
      });

      this.currentStage = null;
      this.emit('stageLeft', {});
      
    } catch (error) {
      console.error('StageOrchestrator: Error leaving stage:', error);
    }
  }

  // Media control methods
  async toggleAudio(): Promise<boolean> {
    try {
      const mediaService = StageMediaService.getInstance();
      const newState = !this.state.mediaState.audioEnabled;
      
      mediaService.toggleAudio(newState);
      
      this.updateState({
        mediaState: { ...this.state.mediaState, audioEnabled: newState }
      });

      this.emit('audioToggled', { enabled: newState });
      return newState;
    } catch (error) {
      console.error('StageOrchestrator: Error toggling audio:', error);
      return this.state.mediaState.audioEnabled;
    }
  }

  async toggleVideo(): Promise<boolean> {
    try {
      const mediaService = StageMediaService.getInstance();
      const newState = !this.state.mediaState.videoEnabled;
      
      mediaService.toggleVideo(newState);
      
      this.updateState({
        mediaState: { ...this.state.mediaState, videoEnabled: newState }
      });

      this.emit('videoToggled', { enabled: newState });
      return newState;
    } catch (error) {
      console.error('StageOrchestrator: Error toggling video:', error);
      return this.state.mediaState.videoEnabled;
    }
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    try {
      const mediaService = StageMediaService.getInstance();
      await mediaService.switchAudioDevice(deviceId);
      this.emit('audioDeviceChanged', { deviceId });
    } catch (error) {
      console.error('StageOrchestrator: Error switching audio device:', error);
    }
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    try {
      const mediaService = StageMediaService.getInstance();
      await mediaService.switchVideoDevice(deviceId);
      this.emit('videoDeviceChanged', { deviceId });
    } catch (error) {
      console.error('StageOrchestrator: Error switching video device:', error);
    }
  }

  // State management
  getState(): StageState {
    return { ...this.state };
  }

  getCurrentStage(): StageConfig | null {
    return this.currentStage ? { ...this.currentStage } : null;
  }

  // Event system
  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error(`StageOrchestrator: Error in event listener for ${event}:`, error);
      }
    });
  }

  private updateState(updates: Partial<StageState>): void {
    this.state = { ...this.state, ...updates };
    this.emit('stateChanged', { state: this.state });
  }

  private setupConnectionMonitoring(): void {
    // Monitor connection quality
    StageConnectionManager.on('qualityUpdate', (data: any) => {
      this.updateState({
        networkQuality: data.quality
      });
    });

    // Monitor remote participants
    StageConnectionManager.on('remoteStream', (data: any) => {
      this.updateState({
        participantCount: this.state.participantCount + 1
      });
    });

    StageConnectionManager.on('userDisconnected', (data: any) => {
      this.updateState({
        participantCount: Math.max(0, this.state.participantCount - 1)
      });
    });

    // Monitor connection errors
    StageConnectionManager.on('connectionError', (data: any) => {
      this.updateState({
        connectionState: 'error',
        errors: [...this.state.errors, data.error]
      });
    });
  }
}

export default StageOrchestrator.getInstance();
