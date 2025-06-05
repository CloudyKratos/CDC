
import { StageStateManager } from './StageStateManager';
import { StageEventManager } from './StageEventManager';
import { StageServiceInitializer } from './StageServiceInitializer';
import { StageConnectionManager } from './StageConnectionManager';
import { StageMetricsService } from './StageMetricsService';
import { StageConfig, StageState } from './types/StageTypes';

export class StageOrchestrator {
  private static instance: StageOrchestrator;
  private stateManager = new StageStateManager();
  private eventManager = new StageEventManager();
  private serviceInitializer = new StageServiceInitializer();
  private connectionManager = new StageConnectionManager();
  private metricsService = new StageMetricsService();

  static getInstance(): StageOrchestrator {
    if (!StageOrchestrator.instance) {
      StageOrchestrator.instance = new StageOrchestrator();
    }
    return StageOrchestrator.instance;
  }

  async initialize(): Promise<void> {
    await this.serviceInitializer.initialize();
  }

  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
    await this.initialize();

    this.stateManager.setCurrentStage(config);
    this.stateManager.setState({
      isConnecting: true,
      connectionState: 'connecting'
    });
    this.eventManager.emit('stateChanged', { state: this.stateManager.getState() });

    const result = await this.connectionManager.initializeStage(config);

    if (result.success) {
      this.stateManager.setState({
        isConnected: true,
        isConnecting: false,
        connectionState: 'connected'
      });
      this.eventManager.emit('stageInitialized', { config });
    } else {
      this.stateManager.setState({
        isConnecting: false,
        isConnected: false,
        connectionState: 'error',
        errors: [result.error || 'Unknown error']
      });
    }

    this.eventManager.emit('stateChanged', { state: this.stateManager.getState() });
    return result;
  }

  async leaveStage(): Promise<void> {
    const currentStage = this.stateManager.getCurrentStage();
    if (!currentStage) return;

    await this.connectionManager.leaveStage(currentStage);
    
    this.stateManager.setState({
      isConnected: false,
      connectionState: 'disconnected'
    });
    this.stateManager.setCurrentStage(null);
    this.eventManager.emit('stageLeft', {});
  }

  async toggleAudio(): Promise<boolean> {
    const result = await this.stateManager.toggleAudio();
    this.eventManager.emit('stateChanged', { state: this.stateManager.getState() });
    return result;
  }

  async toggleVideo(): Promise<boolean> {
    const result = await this.stateManager.toggleVideo();
    this.eventManager.emit('stateChanged', { state: this.stateManager.getState() });
    return result;
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    await this.connectionManager.switchAudioDevice(deviceId);
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    await this.connectionManager.switchVideoDevice(deviceId);
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
    await this.serviceInitializer.emergencyShutdown();
    
    this.stateManager.setState({
      isConnected: false,
      connectionState: 'disconnected'
    });
    this.stateManager.setCurrentStage(null);
  }

  cleanup(): void {
    this.serviceInitializer.cleanup();
    this.stateManager.setCurrentStage(null);
    this.eventManager.clear();

    console.log('Stage Orchestrator cleanup completed');
  }
}

export default StageOrchestrator.getInstance();

// Re-export types for backward compatibility
export * from './types/StageTypes';
