
import { ServiceRegistry } from './ServiceRegistry';
import StageSignalingService from '../StageSignalingService';
import { NextGenWebRTCService } from '../NextGenWebRTCService';
import { StageMonitoringService } from '../monitoring/StageMonitoringService';
import CircuitBreakerService from '../reliability/CircuitBreakerService';
import PerformanceOptimizationService from '../performance/PerformanceOptimizationService';
import ZeroTrustSecurityService from '../security/ZeroTrustSecurityService';
import ComplianceFrameworkService from '../compliance/ComplianceFrameworkService';
import QuantumResistantSecurity from '../security/QuantumResistantSecurity';

export interface StageConfig {
  stageId: string;
  userId: string;
  maxParticipants: number;
  enableRecording: boolean;
  enableSecurity: boolean;
  enableMonitoring: boolean;
  enableCompliance: boolean;
}

export interface StageState {
  isConnected: boolean;
  isConnecting: boolean;
  participantCount: number;
  networkQuality: 'excellent' | 'good' | 'fair' | 'poor';
  securityLevel: 'basic' | 'enhanced' | 'military';
  performanceScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
}

export class StageOrchestrator {
  private static instance: StageOrchestrator;
  private serviceRegistry = ServiceRegistry.getInstance();
  private isInitialized = false;
  private currentStage: StageConfig | null = null;
  private stageState: StageState = {
    isConnected: false,
    isConnecting: false,
    participantCount: 0,
    networkQuality: 'good',
    securityLevel: 'enhanced',
    performanceScore: 100,
    complianceStatus: 'compliant'
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
      // Register all services
      this.serviceRegistry.registerService('signaling', StageSignalingService);
      this.serviceRegistry.registerService('webrtc', NextGenWebRTCService);
      this.serviceRegistry.registerService('monitoring', StageMonitoringService);
      this.serviceRegistry.registerService('circuit-breaker', CircuitBreakerService);
      this.serviceRegistry.registerService('performance', PerformanceOptimizationService);
      this.serviceRegistry.registerService('security', ZeroTrustSecurityService);
      this.serviceRegistry.registerService('compliance', ComplianceFrameworkService);
      this.serviceRegistry.registerService('quantum-security', QuantumResistantSecurity);

      // Initialize critical services
      await QuantumResistantSecurity.initialize();
      await PerformanceOptimizationService.initialize();
      await ZeroTrustSecurityService.initialize();
      await ComplianceFrameworkService.initialize();

      // Start monitoring
      StageMonitoringService.startMonitoring();

      this.isInitialized = true;
      console.log('Stage Orchestrator initialized successfully with military-grade security');

    } catch (error) {
      console.error('Failed to initialize Stage Orchestrator:', error);
      throw error;
    }
  }

  async joinStage(config: StageConfig): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.currentStage = config;
    this.stageState.isConnecting = true;

    try {
      console.log('Joining stage with enterprise-grade orchestration:', config.stageId);

      // Create security context
      if (config.enableSecurity) {
        await ZeroTrustSecurityService.createSecurityContext(config.userId);
        console.log('Security context established');
      }

      // Record compliance data
      if (config.enableCompliance) {
        await ComplianceFrameworkService.recordDataProcessing({
          userId: config.userId,
          dataType: 'communications',
          action: 'process',
          purpose: 'Stage call participation',
          legalBasis: 'Consent',
          location: 'EU',
          encrypted: true
        });
      }

      // Join signaling with circuit breaker protection
      const signalingSuccess = await CircuitBreakerService.execute(
        'signaling-service',
        () => StageSignalingService.joinStage(config.stageId, config.userId),
        () => this.fallbackSignaling(config.stageId, config.userId)
      );

      if (!signalingSuccess) {
        throw new Error('Failed to establish signaling connection');
      }

      this.stageState.isConnected = true;
      this.stageState.isConnecting = false;
      this.updateStageState();

      console.log('Successfully joined stage with all enterprise services active');
      return true;

    } catch (error) {
      console.error('Failed to join stage:', error);
      this.stageState.isConnecting = false;
      this.stageState.isConnected = false;
      return false;
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
        await ComplianceFrameworkService.recordDataProcessing({
          userId: this.currentStage.userId,
          dataType: 'communications',
          action: 'delete',
          purpose: 'Stage call ended',
          legalBasis: 'Data minimization',
          location: 'EU',
          encrypted: true
        });
      }

      this.stageState.isConnected = false;
      this.currentStage = null;

      console.log('Stage cleanup completed');

    } catch (error) {
      console.error('Error during stage cleanup:', error);
    }
  }

  private updateStageState(): void {
    if (!this.currentStage) return;

    // Update network quality
    const networkQuality = StageSignalingService.getNetworkQuality();
    if (networkQuality) {
      this.stageState.networkQuality = networkQuality.quality;
    }

    // Update performance score
    const performanceMetrics = PerformanceOptimizationService.getLatestMetrics();
    if (performanceMetrics) {
      this.stageState.performanceScore = this.calculatePerformanceScore(performanceMetrics);
    }

    // Update security level
    const securityContext = ZeroTrustSecurityService.getSecurityContext(this.currentStage.userId);
    if (securityContext) {
      this.stageState.securityLevel = this.calculateSecurityLevel(securityContext.riskScore);
    }

    // Update participant count
    this.stageState.participantCount = StageSignalingService.getConnectedUsers().length;

    // Check compliance status
    this.stageState.complianceStatus = this.checkComplianceStatus();
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
    const hasConsent = ComplianceFrameworkService.hasValidConsent(
      this.currentStage.userId, 
      'data_processing'
    );

    if (!hasConsent) return 'violation';

    // Check for any warnings
    const threats = ZeroTrustSecurityService.getThreatDetections(this.currentStage.userId);
    const recentThreats = threats.filter(t => Date.now() - t.timestamp < 60000); // Last minute

    if (recentThreats.length > 0) return 'warning';

    return 'compliant';
  }

  // Public interface methods
  getStageState(): StageState {
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

    return await ZeroTrustSecurityService.validateAccess(
      this.currentStage.userId, 
      resource
    );
  }

  getPerformanceMetrics(): any {
    return PerformanceOptimizationService.getLatestMetrics();
  }

  getSecurityMetrics(): any {
    if (!this.currentStage) return null;

    return {
      securityContext: ZeroTrustSecurityService.getSecurityContext(this.currentStage.userId),
      threats: ZeroTrustSecurityService.getThreatDetections(this.currentStage.userId),
      circuitBreakerStates: CircuitBreakerService.getAllCircuits()
    };
  }

  getComplianceMetrics(): any {
    if (!this.currentStage) return null;

    const endDate = Date.now();
    const startDate = endDate - (24 * 60 * 60 * 1000); // Last 24 hours

    return ComplianceFrameworkService.generateGDPRReport(startDate, endDate);
  }

  async emergencyShutdown(): Promise<void> {
    console.log('Initiating emergency shutdown...');

    try {
      // Stop all services immediately
      StageMonitoringService.stopMonitoring();
      NextGenWebRTCService.cleanup();
      await StageSignalingService.leaveStage();
      PerformanceOptimizationService.cleanup();
      ZeroTrustSecurityService.cleanup();
      QuantumResistantSecurity.cleanup();

      this.stageState.isConnected = false;
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

    console.log('Stage Orchestrator cleanup completed');
  }
}

export default StageOrchestrator.getInstance();
