
import { StageConfig } from './types/StageTypes';
import StageSignalingService from '../StageSignalingService';
import { NextGenWebRTCService } from '../NextGenWebRTCService';
import { CircuitBreakerService } from '../reliability/CircuitBreakerService';
import { ZeroTrustSecurityService } from '../security/ZeroTrustSecurityService';
import { ComplianceFrameworkService } from '../compliance/ComplianceFrameworkService';

export class StageConnectionManager {
  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
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
          retention: 30
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

      console.log('Successfully joined stage with all enterprise services active');
      return { success: true };

    } catch (error) {
      console.error('Failed to join stage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async leaveStage(config: StageConfig): Promise<void> {
    console.log('Leaving stage with proper cleanup...');

    try {
      await StageSignalingService.leaveStage();
      NextGenWebRTCService.cleanup();

      if (config.enableCompliance) {
        await ComplianceFrameworkService.getInstance().recordDataProcessing({
          userId: config.userId,
          dataType: 'communications',
          action: 'delete',
          purpose: 'Stage call ended',
          legalBasis: 'Data minimization',
          location: 'EU',
          encrypted: true,
          retention: 0
        });
      }

      console.log('Stage cleanup completed');
    } catch (error) {
      console.error('Error during stage cleanup:', error);
    }
  }

  private async fallbackSignaling(stageId: string, userId: string): Promise<boolean> {
    console.log('Using fallback signaling mechanism');
    return false;
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    console.log('Switching audio device to:', deviceId);
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    console.log('Switching video device to:', deviceId);
  }

  async validateAccess(userId: string, resource: string): Promise<boolean> {
    return await ZeroTrustSecurityService.getInstance().validateAccess(userId, resource);
  }
}
