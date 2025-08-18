
import { EnhancedStageStateManager } from './EnhancedStageStateManager';
import { StageEventManager } from './StageEventManager';
import { StageServiceInitializer } from './StageServiceInitializer';
import { StageConnectionManager } from './StageConnectionManager';
import { StageMetricsService } from './StageMetricsService';
import { StageErrorHandler } from './StageErrorHandler';
import { StageTimeoutManager } from './StageTimeoutManager';
import { StageConfig, StageState } from './types/StageTypes';

export class StageOrchestrator {
  private static instance: StageOrchestrator;
  private stateManager = new EnhancedStageStateManager();
  private eventManager = new StageEventManager();
  private serviceInitializer = new StageServiceInitializer();
  private connectionManager = new StageConnectionManager();
  private metricsService = new StageMetricsService();
  private errorHandler = StageErrorHandler.getInstance();
  private timeoutManager = StageTimeoutManager.getInstance();
  private isInitialized = false;

  static getInstance(): StageOrchestrator {
    if (!StageOrchestrator.instance) {
      StageOrchestrator.instance = new StageOrchestrator();
    }
    return StageOrchestrator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.timeoutManager.executeWithTimeout('initialization', async () => {
        await this.serviceInitializer.initialize();
      });

      // Set up error recovery
      this.errorHandler.on('recovery-suggested', (error) => {
        console.log('Auto-recovery suggested for error:', error);
        this.handleAutoRecovery(error);
      });

      // Set up state change monitoring
      this.stateManager.onStateChange((newState, previousState) => {
        this.eventManager.emit('stateChanged', { state: newState, previousState });
      });

      this.isInitialized = true;
      console.log('Stage Orchestrator initialized successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'initialize' });
      throw error;
    }
  }

  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
    try {
      await this.initialize();

      this.stateManager.setCurrentStage(config);
      
      if (!this.stateManager.setStateWithValidation({
        isConnecting: true,
        connectionState: 'connecting'
      })) {
        return { success: false, error: 'Failed to update state for connection' };
      }

      const result = await this.timeoutManager.executeWithTimeout('connection', async () => {
        return await this.connectionManager.initializeStage(config);
      });

      if (result.success) {
        this.stateManager.setStateWithValidation({
          isConnected: true,
          isConnecting: false,
          connectionState: 'connected'
        });
        this.eventManager.emit('stageInitialized', { config });
        console.log('Stage initialized successfully:', config.stageId);
      } else {
        this.stateManager.setStateWithValidation({
          isConnecting: false,
          isConnected: false,
          connectionState: 'error'
        });
        this.stateManager.addError(result.error || 'Unknown error');
        this.errorHandler.handleError(result.error || 'Stage initialization failed', { config });
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Stage initialization failed';
      this.errorHandler.handleError(error as Error, { config, operation: 'initializeStage' });
      
      this.stateManager.setStateWithValidation({
        isConnecting: false,
        isConnected: false,
        connectionState: 'error'
      });
      this.stateManager.addError(errorMessage);

      return { success: false, error: errorMessage };
    }
  }

  async leaveStage(): Promise<void> {
    try {
      const currentStage = this.stateManager.getCurrentStage();
      if (!currentStage) {
        console.log('No current stage to leave');
        return;
      }

      console.log('Leaving stage:', currentStage.stageId);

      await this.timeoutManager.executeWithTimeout('cleanup', async () => {
        await this.connectionManager.leaveStage(currentStage);
      });
      
      this.stateManager.setStateWithValidation({
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected'
      });
      this.stateManager.setCurrentStage(null);
      this.stateManager.clearErrors();
      
      this.eventManager.emit('stageLeft', { stageId: currentStage.stageId });
      console.log('Successfully left stage');
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'leaveStage' });
      
      // Force state reset even if cleanup fails
      this.stateManager.setStateWithValidation({
        isConnected: false,
        isConnecting: false,
        connectionState: 'disconnected'
      });
      this.stateManager.setCurrentStage(null);
    }
  }

  async toggleAudio(): Promise<boolean> {
    try {
      const result = await this.stateManager.toggleAudio();
      console.log('Audio toggled:', result);
      return result;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'toggleAudio' });
      return this.stateManager.getState().mediaState.audioEnabled;
    }
  }

  async toggleVideo(): Promise<boolean> {
    try {
      const result = await this.stateManager.toggleVideo();
      console.log('Video toggled:', result);
      return result;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'toggleVideo' });
      return this.stateManager.getState().mediaState.videoEnabled;
    }
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    try {
      await this.timeoutManager.executeWithTimeout('device-switch', async () => {
        await this.connectionManager.switchAudioDevice(deviceId);
      });
      console.log('Audio device switched to:', deviceId);
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'switchAudioDevice', deviceId });
    }
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    try {
      await this.timeoutManager.executeWithTimeout('device-switch', async () => {
        await this.connectionManager.switchVideoDevice(deviceId);
      });
      console.log('Video device switched to:', deviceId);
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'switchVideoDevice', deviceId });
    }
  }

  on(event: string, callback: (data: any) => void): void {
    this.eventManager.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.eventManager.off(event, callback);
  }

  getState(): StageState {
    return this.stateManager.getState();
  }

  getCurrentStage(): StageConfig | null {
    return this.stateManager.getCurrentStage();
  }

  getServiceHealth(): { [key: string]: boolean } {
    return this.serviceInitializer.getServiceHealth();
  }

  async validateAccess(resource: string): Promise<boolean> {
    const currentStage = this.stateManager.getCurrentStage();
    if (!currentStage) return false;

    return await this.connectionManager.validateAccess(currentStage.userId, resource);
  }

  getPerformanceMetrics(): any {
    return this.metricsService.getPerformanceMetrics();
  }

  getSecurityMetrics(): any {
    return this.metricsService.getSecurityMetrics(this.stateManager.getCurrentStage());
  }

  getComplianceMetrics(): any {
    return this.metricsService.getComplianceMetrics(this.stateManager.getCurrentStage());
  }

  async emergencyShutdown(): Promise<void> {
    try {
      console.log('Initiating emergency shutdown');
      
      await this.timeoutManager.executeWithTimeout('emergency-shutdown', async () => {
        await this.serviceInitializer.emergencyShutdown();
      }, 10000); // 10 second timeout for emergency shutdown
      
      this.stateManager.resetState();
      console.log('Emergency shutdown completed');
    } catch (error) {
      console.error('Emergency shutdown failed:', error);
      // Force cleanup even if emergency shutdown fails
      this.stateManager.resetState();
    }
  }

  private async handleAutoRecovery(error: any): Promise<void> {
    try {
      const currentStage = this.stateManager.getCurrentStage();
      if (!currentStage) return;

      console.log('Attempting auto-recovery for stage:', currentStage.stageId);
      
      // Try to reinitialize the stage
      await this.leaveStage();
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      await this.initializeStage(currentStage);
    } catch (recoveryError) {
      this.errorHandler.handleError(recoveryError as Error, { 
        operation: 'auto-recovery',
        originalError: error 
      });
    }
  }

  cleanup(): void {
    try {
      console.log('Starting Stage Orchestrator cleanup');
      
      this.serviceInitializer.cleanup();
      this.stateManager.cleanup();
      this.eventManager.clear();
      this.errorHandler.cleanup();
      this.timeoutManager.cleanup();
      
      this.isInitialized = false;
      console.log('Stage Orchestrator cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

export default StageOrchestrator.getInstance();

// Re-export types for backward compatibility
export * from './types/StageTypes';
