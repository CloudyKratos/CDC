import { ServiceRegistry } from './ServiceRegistry';
import StageSignalingService from '../StageSignalingService';
import { NextGenWebRTCService } from '../NextGenWebRTCService';
import StageMonitoringService from '../monitoring/StageMonitoringService';
import CircuitBreakerService from '../reliability/CircuitBreakerService';
import PerformanceOptimizationService from '../performance/PerformanceOptimizationService';
import ZeroTrustSecurityService from '../security/ZeroTrustSecurityService';
import ComplianceFrameworkService from '../compliance/ComplianceFrameworkService';
import QuantumResistantSecurity from '../security/QuantumResistantSecurity';

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
  private serviceRegistry = ServiceRegistry.getInstance();
  private isInitialized = false;
  private currentStage: StageConfig | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private stageState: StageState = {
    connectionState: 'disconnected',
    isConnected: false,
    isConnecting: false,
    participantCount: 0,
    networkQuality: {
      quality: 'good',
      ping: 50,
      bandwidth: 1000
    },
    securityLevel: 'enhanced',
    performanceScore: 100,
    complianceStatus: 'compliant',
    mediaState: {
      audioEnabled: false,
      videoEnabled: false,
      devices: {
        audio: [],
        video: []
      }
    },
    errors: []
  };

  static getInstance(): StageOrchestrator {
    if (!StageOrchestrator.instance) {
      StageOrchestrator.instance = new StageOrchestrator();
    }
    return StageOrchestrator.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing Stage Orchestrator with enterprise services...');

    try {
      // Register all services using correct static getInstance methods
      this.serviceRegistry.registerService('signaling', StageSignalingService);
      this.serviceRegistry.registerService('webrtc', NextGenWebRTCService.getInstance());
      this.serviceRegistry.registerService('monitoring', StageMonitoringService.getInstance());
      this.serviceRegistry.registerService('circuit-breaker', CircuitBreakerService.getInstance());
      this.serviceRegistry.registerService('performance', PerformanceOptimizationService.getInstance());
      this.serviceRegistry.registerService('security', ZeroTrustSecurityService.getInstance());
      this.serviceRegistry.registerService('compliance', ComplianceFrameworkService.getInstance());
      this.serviceRegistry.registerService('quantum-security', QuantumResistantSecurity.getInstance());

      // Initialize critical services using correct static methods
      await QuantumResistantSecurity.getInstance().initialize();
      await PerformanceOptimizationService.getInstance().initialize();
      await ZeroTrustSecurityService.initialize();
      await ComplianceFrameworkService.initialize();

      // Start monitoring using correct static method
      StageMonitoringService.startMonitoring();

      this.isInitialized = true;
      console.log('Stage Orchestrator initialized successfully with military-grade security');

    } catch (error) {
      console.error('Failed to initialize Stage Orchestrator:', error);
      throw error;
    }
  }

  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.currentStage = config;
    this.stageState.isConnecting = true;
    this.stageState.connectionState = 'connecting';
    this.emit('stateChanged', { state: this.stageState });

    try {
      console.log('Joining stage with enterprise-grade orchestration:', config.stageId);

      // Create security context
      if (config.enableSecurity) {
        await ZeroTrustSecurityService.getInstance().createSecurityContext(config.userId);
        console.log('Security context established');
      }

      // Record compliance data
      if (config.enableCompliance) {
        await ComplianceFrameworkService.getInstance().recordDataProcessing({
          userId: config.userId,
          dataType: 'communications',
          action: 'process',
          purpose: 'Stage call participation',
          legalBasis: 'Consent',
          location: 'EU',
          encrypted: true,
          retention: 30 // 30 days
        });
      }

      // Join signaling with circuit breaker protection
      const signalingSuccess = await CircuitBreakerService.getInstance().execute(
        'signaling-service',
        () => StageSignalingService.joinStage(config.stageId, config.userId),
        () => this.fallbackSignaling(config.stageId, config.userId)
      );

      if (!signalingSuccess) {
        throw new Error('Failed to establish signaling connection');
      }

      this.stageState.isConnected = true;
      this.stageState.isConnecting = false;
      this.stageState.connectionState = 'connected';
      this.updateStageState();
      this.emit('stageInitialized', { config });

      console.log('Successfully joined stage with all enterprise services active');
      return { success: true };

    } catch (error) {
      console.error('Failed to join stage:', error);
      this.stageState.isConnecting = false;
      this.stageState.isConnected = false;
      this.stageState.connectionState = 'error';
      this.stageState.errors = [error instanceof Error ? error.message : 'Unknown error'];
      this.emit('stateChanged', { state: this.stageState });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private async fallbackSignaling(stageId: string, userId: string): Promise<boolean> {
    console.log('Using fallback signaling mechanism');
    // Implement fallback signaling logic
    return false;
  }

  async leaveStage(): Promise<void> {
    if (!this.currentStage) return;

    console.log('Leaving stage with proper cleanup...');

    try {
      // Leave signaling
      await StageSignalingService.leaveStage();

      // Cleanup WebRTC connections
      NextGenWebRTCService.cleanup();

      // Record compliance data
      if (this.currentStage.enableCompliance) {
        await ComplianceFrameworkService.getInstance().recordDataProcessing({
          userId: this.currentStage.userId,
          dataType: 'communications',
          action: 'delete',
          purpose: 'Stage call ended',
          legalBasis: 'Data minimization',
          location: 'EU',
          encrypted: true,
          retention: 0 // Immediate deletion
        });
      }

      this.stageState.isConnected = false;
      this.stageState.connectionState = 'disconnected';
      this.currentStage = null;
      this.emit('stageLeft', {});

      console.log('Stage cleanup completed');

    } catch (error) {
      console.error('Error during stage cleanup:', error);
    }
  }

  async toggleAudio(): Promise<boolean> {
    this.stageState.mediaState.audioEnabled = !this.stageState.mediaState.audioEnabled;
    this.emit('stateChanged', { state: this.stageState });
    return this.stageState.mediaState.audioEnabled;
  }

  async toggleVideo(): Promise<boolean> {
    this.stageState.mediaState.videoEnabled = !this.stageState.mediaState.videoEnabled;
    this.emit('stateChanged', { state: this.stageState });
    return this.stageState.mediaState.videoEnabled;
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    console.log('Switching audio device to:', deviceId);
    // Implementation would involve WebRTC service
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    console.log('Switching video device to:', deviceId);
    // Implementation would involve WebRTC service
  }

  private updateStageState(): void {
    if (!this.currentStage) return;

    // Update network quality
    const networkQuality = StageSignalingService.getNetworkQuality();
    if (networkQuality) {
      this.stageState.networkQuality = {
        quality: networkQuality.quality,
        ping: networkQuality.ping,
        bandwidth: networkQuality.bandwidth
      };
    }

    // Update performance score
    const performanceMetrics = PerformanceOptimizationService.getInstance().getLatestMetrics();
    if (performanceMetrics) {
      this.stageState.performanceScore = this.calculatePerformanceScore(performanceMetrics);
    }

    // Update security level
    const securityContext = ZeroTrustSecurityService.getInstance().getSecurityContext(this.currentStage.userId);
    if (securityContext) {
      this.stageState.securityLevel = this.calculateSecurityLevel(securityContext.riskScore);
    }

    // Update participant count
    this.stageState.participantCount = StageSignalingService.getConnectedUsers().length;

    // Check compliance status
    this.stageState.complianceStatus = this.checkComplianceStatus();

    this.emit('stateChanged', { state: this.stageState });
  }

  private calculatePerformanceScore(metrics: any): number {
    // Calculate composite performance score
    const cpuScore = Math.max(0, 100 - metrics.cpuUsage);
    const memoryScore = Math.max(0, 100 - metrics.memoryUsage);
    const latencyScore = Math.max(0, 100 - (metrics.latency / 10));
    
    return Math.round((cpuScore + memoryScore + latencyScore) / 3);
  }

  private calculateSecurityLevel(riskScore: number): 'basic' | 'enhanced' | 'military' {
    if (riskScore < 20) return 'military';
    if (riskScore < 50) return 'enhanced';
    return 'basic';
  }

  private checkComplianceStatus(): 'compliant' | 'warning' | 'violation' {
    if (!this.currentStage?.enableCompliance) return 'compliant';

    // Check for any compliance violations
    const hasConsent = ComplianceFrameworkService.getInstance().hasValidConsent(
      this.currentStage.userId, 
      'data_processing'
    );

    if (!hasConsent) return 'violation';

    // Check for any warnings
    const threats = ZeroTrustSecurityService.getInstance().getThreatDetections(this.currentStage.userId);
    const recentThreats = threats.filter(t => Date.now() - t.timestamp < 60000); // Last minute

    if (recentThreats.length > 0) return 'warning';

    return 'compliant';
  }

  // Event system
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Public interface methods
  getState(): StageState {
    this.updateStageState();
    return { ...this.stageState };
  }

  getCurrentStage(): StageConfig | null {
    return this.currentStage ? { ...this.currentStage } : null;
  }

  getServiceHealth(): { [key: string]: boolean } {
    return this.serviceRegistry.getHealthStatus();
  }

  async validateAccess(resource: string): Promise<boolean> {
    if (!this.currentStage) return false;

    return await ZeroTrustSecurityService.getInstance().validateAccess(
      this.currentStage.userId, 
      resource
    );
  }

  getPerformanceMetrics(): any {
    return PerformanceOptimizationService.getInstance().getLatestMetrics();
  }

  getSecurityMetrics(): any {
    if (!this.currentStage) return null;

    return {
      securityContext: ZeroTrustSecurityService.getInstance().getSecurityContext(this.currentStage.userId),
      threats: ZeroTrustSecurityService.getInstance().getThreatDetections(this.currentStage.userId),
      circuitBreakerStates: CircuitBreakerService.getInstance().getAllCircuits()
    };
  }

  getComplianceMetrics(): any {
    if (!this.currentStage) return null;

    const endDate = Date.now();
    const startDate = endDate - (24 * 60 * 60 * 1000); // Last 24 hours

    return ComplianceFrameworkService.getInstance().generateGDPRReport(startDate, endDate);
  }

  async emergencyShutdown(): Promise<void> {
    console.log('Initiating emergency shutdown...');

    try {
      // Stop all services immediately using correct static methods
      StageMonitoringService.stopMonitoring();
      NextGenWebRTCService.cleanup();
      await StageSignalingService.leaveStage();
      PerformanceOptimizationService.getInstance().cleanup();
      ZeroTrustSecurityService.getInstance().cleanup();
      QuantumResistantSecurity.cleanup();

      this.stageState.isConnected = false;
      this.stageState.connectionState = 'disconnected';
      this.currentStage = null;

      console.log('Emergency shutdown completed');

    } catch (error) {
      console.error('Error during emergency shutdown:', error);
    }
  }

  cleanup(): void {
    // Cleanup all services
    this.serviceRegistry.cleanup();
    this.currentStage = null;
    this.isInitialized = false;
    this.eventListeners.clear();

    console.log('Stage Orchestrator cleanup completed');
  }
}

export default StageOrchestrator.getInstance();
