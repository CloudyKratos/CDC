
import { StageStateManager } from './StageStateManager';
import { StageEventManager } from './StageEventManager';
import { StageServiceInitializer } from './StageServiceInitializer';
import { StageConnectionManager } from './StageConnectionManager';
import PerformanceOptimizationService from '../performance/PerformanceOptimizationService';
import ZeroTrustSecurityService from '../security/ZeroTrustSecurityService';
import CircuitBreakerService from '../reliability/CircuitBreakerService';
import ComplianceFrameworkService from '../compliance/ComplianceFrameworkService';

export interface StageConfig {
  stageId: string;
  userId: string;
  userRole?: 'speaker' | 'audience';
  maxParticipants?: number;
  enableRecording?: boolean;
  enableSecurity?: boolean;
  enableMonitoring?: boolean;
  enableCompliance?: boolean;
  mediaConstraints?: {
    audio: boolean;
    video: boolean;
  };
  qualitySettings?: {
    maxBitrate: number;
    adaptiveStreaming: boolean;
    lowLatencyMode: boolean;
  };
}

export interface NetworkQuality {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  ping: number;
  bandwidth: number;
  jitter?: number;
  packetLoss?: number;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
  groupId?: string;
}

export interface MediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  devices: {
    audio: MediaDevice[];
    video: MediaDevice[];
  };
}

export interface StageState {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  participantCount: number;
  networkQuality: NetworkQuality;
  securityLevel: 'basic' | 'enhanced' | 'military';
  performanceScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  mediaState: MediaState;
  errors: string[];
}

export class StageOrchestrator {
  private static instance: StageOrchestrator;
  private stateManager = new StageStateManager();
  private eventManager = new StageEventManager();
  private serviceInitializer = new StageServiceInitializer();
  private connectionManager = new StageConnectionManager();

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

  // Event system delegation
  on(event: string, callback: (data: any) => void): void {
    this.eventManager.on(event, callback);
  }

  off(event: string, callback: (data: any) => void): void {
    this.eventManager.off(event, callback);
  }

  // Public interface methods
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
    return PerformanceOptimizationService.getInstance().getLatestMetrics();
  }

  getSecurityMetrics(): any {
    const currentStage = this.stateManager.getCurrentStage();
    if (!currentStage) return null;

    return {
      securityContext: ZeroTrustSecurityService.getInstance().getSecurityContext(currentStage.userId),
      threats: ZeroTrustSecurityService.getInstance().getThreatDetections(currentStage.userId),
      circuitBreakerStates: CircuitBreakerService.getInstance().getAllCircuits()
    };
  }

  getComplianceMetrics(): any {
    const currentStage = this.stateManager.getCurrentStage();
    if (!currentStage) return null;

    const endDate = Date.now();
    const startDate = endDate - (24 * 60 * 60 * 1000);

    return ComplianceFrameworkService.getInstance().generateGDPRReport(startDate, endDate);
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
