import { StageConfig, StageState } from './types/StageTypes';
import { StageErrorHandler } from './StageErrorHandler';

export class EnhancedStageStateManager {
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
  private stateListeners: Set<Function> = new Set();
  private stateHistory: Array<{ state: StageState; timestamp: Date }> = [];
  private maxHistorySize = 20;
  private errorHandler = StageErrorHandler.getInstance();

  getState(): StageState {
    return { ...this.state };
  }

  setState(updates: Partial<StageState>): void {
    const previousState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Add to history
    this.addStateToHistory(this.state);
    
    // Validate state consistency
    this.validateState();
    
    // Notify listeners
    this.notifyStateChange(previousState, this.state);
    
    console.log('State updated:', updates);
  }

  setStateWithValidation(updates: Partial<StageState>): boolean {
    try {
      const newState = { ...this.state, ...updates };
      
      // Validate the new state
      if (!this.isValidState(newState)) {
        this.errorHandler.handleError(
          new Error('Invalid state transition attempted'),
          { currentState: this.state, updates }
        );
        return false;
      }
      
      this.setState(updates);
      return true;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { updates });
      return false;
    }
  }

  private isValidState(state: StageState): boolean {
    // State validation rules
    if (state.isConnected && state.connectionState === 'disconnected') {
      return false;
    }
    
    if (state.isConnecting && state.isConnected) {
      return false;
    }
    
    if (state.participantCount < 0) {
      return false;
    }
    
    return true;
  }

  private validateState(): void {
    if (!this.isValidState(this.state)) {
      console.warn('State validation failed, attempting correction');
      this.correctState();
    }
  }

  private correctState(): void {
    const corrections: Partial<StageState> = {};
    
    // Fix conflicting connection states
    if (this.state.isConnected && this.state.connectionState === 'disconnected') {
      corrections.connectionState = 'connected';
    }
    
    if (this.state.isConnecting && this.state.isConnected) {
      corrections.isConnecting = false;
    }
    
    // Fix negative participant count
    if (this.state.participantCount < 0) {
      corrections.participantCount = 0;
    }
    
    if (Object.keys(corrections).length > 0) {
      console.log('Applying state corrections:', corrections);
      this.state = { ...this.state, ...corrections };
    }
  }

  private addStateToHistory(state: StageState): void {
    this.stateHistory.push({
      state: { ...state },
      timestamp: new Date()
    });
    
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  private notifyStateChange(previousState: StageState, newState: StageState): void {
    this.stateListeners.forEach(listener => {
      try {
        listener(newState, previousState);
      } catch (error) {
        this.errorHandler.handleError(
          error as Error,
          { context: 'state listener notification' }
        );
      }
    });
  }

  onStateChange(listener: (newState: StageState, previousState?: StageState) => void): () => void {
    this.stateListeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  setCurrentStage(stage: StageConfig | null): void {
    this.currentStage = stage;
    console.log('Current stage set:', stage?.stageId || 'null');
  }

  getCurrentStage(): StageConfig | null {
    return this.currentStage;
  }

  async toggleAudio(): Promise<boolean> {
    try {
      const newState = !this.state.mediaState.audioEnabled;
      this.setState({
        mediaState: {
          ...this.state.mediaState,
          audioEnabled: newState
        }
      });
      return newState;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'toggleAudio' });
      return this.state.mediaState.audioEnabled;
    }
  }

  async toggleVideo(): Promise<boolean> {
    try {
      const newState = !this.state.mediaState.videoEnabled;
      this.setState({
        mediaState: {
          ...this.state.mediaState,
          videoEnabled: newState
        }
      });
      return newState;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'toggleVideo' });
      return this.state.mediaState.videoEnabled;
    }
  }

  updateNetworkQuality(quality: any): void {
    try {
      this.setState({
        networkQuality: { ...this.state.networkQuality, ...quality }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'updateNetworkQuality' });
    }
  }

  addError(error: string): void {
    const newErrors = [...this.state.errors, error];
    // Keep only the last 10 errors
    if (newErrors.length > 10) {
      newErrors.shift();
    }
    this.setState({ errors: newErrors });
  }

  clearErrors(): void {
    this.setState({ errors: [] });
  }

  getStateHistory(minutes: number = 5): Array<{ state: StageState; timestamp: Date }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.stateHistory.filter(entry => entry.timestamp > cutoff);
  }

  resetState(): void {
    console.log('Resetting stage state to default');
    this.state = {
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
    this.currentStage = null;
    this.stateHistory = [];
  }

  cleanup(): void {
    this.resetState();
    this.stateListeners.clear();
    console.log('Enhanced Stage State Manager cleaned up');
  }
}
