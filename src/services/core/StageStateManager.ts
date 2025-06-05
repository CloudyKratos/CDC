
import { StageConfig, StageState, NetworkQuality, MediaState } from './StageOrchestrator';
import StageSignalingService from '../StageSignalingService';
import { PerformanceOptimizationService } from '../performance/PerformanceOptimizationService';
import { ZeroTrustSecurityService } from '../security/ZeroTrustSecurityService';
import { ComplianceFrameworkService } from '../compliance/ComplianceFrameworkService';

export class StageStateManager {
  private stageState: StageState;
  private currentStage: StageConfig | null = null;

  constructor() {
    this.stageState = {
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
  }

  getState(): StageState {
    this.updateStageState();
    return { ...this.stageState };
  }

  setState(updates: Partial<StageState>): void {
    this.stageState = { ...this.stageState, ...updates };
  }

  setCurrentStage(stage: StageConfig | null): void {
    this.currentStage = stage;
  }

  getCurrentStage(): StageConfig | null {
    return this.currentStage ? { ...this.currentStage } : null;
  }

  async toggleAudio(): Promise<boolean> {
    this.stageState.mediaState.audioEnabled = !this.stageState.mediaState.audioEnabled;
    return this.stageState.mediaState.audioEnabled;
  }

  async toggleVideo(): Promise<boolean> {
    this.stageState.mediaState.videoEnabled = !this.stageState.mediaState.videoEnabled;
    return this.stageState.mediaState.videoEnabled;
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
  }

  private calculatePerformanceScore(metrics: any): number {
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

    const hasConsent = ComplianceFrameworkService.getInstance().hasValidConsent(
      this.currentStage.userId, 
      'data_processing'
    );

    if (!hasConsent) return 'violation';

    const threats = ZeroTrustSecurityService.getInstance().getThreatDetections(this.currentStage.userId);
    const recentThreats = threats.filter(t => Date.now() - t.timestamp < 60000);

    if (recentThreats.length > 0) return 'warning';

    return 'compliant';
  }
}
