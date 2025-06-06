
import { StageConfig, StageState } from './types/StageTypes';

export class StageStateManager {
  private state: StageState = {
    isConnected: false,
    isConnecting: false,
    connectionState: 'disconnected',
    participantCount: 0,
    mediaState: {
      audioEnabled: false,
      videoEnabled: false,
      devices: {
        audio: [],
        video: []
      }
    },
    networkQuality: {
      quality: 'good',
      ping: 0,
      bandwidth: 0
    },
    errors: []
  };
  
  private currentStage: StageConfig | null = null;

  getState(): StageState {
    return { ...this.state };
  }

  setState(updates: Partial<StageState>): void {
    this.state = { ...this.state, ...updates };
  }

  setCurrentStage(stage: StageConfig | null): void {
    this.currentStage = stage;
  }

  getCurrentStage(): StageConfig | null {
    return this.currentStage;
  }

  async toggleAudio(): Promise<boolean> {
    this.state.mediaState.audioEnabled = !this.state.mediaState.audioEnabled;
    return this.state.mediaState.audioEnabled;
  }

  async toggleVideo(): Promise<boolean> {
    this.state.mediaState.videoEnabled = !this.state.mediaState.videoEnabled;
    return this.state.mediaState.videoEnabled;
  }

  updateNetworkQuality(quality: any): void {
    this.state.networkQuality = { ...this.state.networkQuality, ...quality };
  }

  addError(error: string): void {
    this.state.errors.push(error);
  }

  clearErrors(): void {
    this.state.errors = [];
  }
}
