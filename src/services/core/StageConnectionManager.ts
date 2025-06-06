
import { StageConfig } from './types/StageTypes';
import StageSignalingService from '../StageSignalingService';
import { NextGenWebRTCService } from '../NextGenWebRTCService';
import { CircuitBreakerService } from '../reliability/CircuitBreakerService';
import { ZeroTrustSecurityService } from '../security/ZeroTrustSecurityService';
import { ComplianceFrameworkService } from '../compliance/ComplianceFrameworkService';

export class StageConnectionManager {
  private circuitBreakerInitialized = false;
  private circuitBreakerService = CircuitBreakerService.getInstance();

  private async initializeCircuitBreakers(): Promise<void> {
    if (this.circuitBreakerInitialized) return;

    // Create circuit breakers for critical services using the instance
    this.circuitBreakerService.createCircuit('signaling-service', {
      failureThreshold: 3,
      recoveryTimeout: 30000,
      monitoringPeriod: 5000,
      halfOpenMaxCalls: 2
    });

    this.circuitBreakerInitialized = true;
    console.log('Circuit breakers initialized');
  }

  async initializeStage(config: StageConfig): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Joining stage with enterprise-grade orchestration:', config.stageId);

      // Initialize circuit breakers first
      await this.initializeCircuitBreakers();

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

      // Join signaling with circuit breaker protection and fallback
      const signalingSuccess = await this.circuitBreakerService.execute(
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
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'Session already exists. Please try force reconnecting to clean up the previous session.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return { success: false, error: errorMessage };
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
    console.log('Using fallback signaling mechanism - attempting direct connection');
    
    try {
      // Simplified fallback - direct connection without circuit breaker
      return await StageSignalingService.joinStage(stageId, userId);
    } catch (error) {
      console.error('Fallback signaling also failed:', error);
      return false;
    }
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    console.log('Switching audio device to:', deviceId);
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    console.log('Switching video device to:', deviceId);
  }

  async validateAccess(userId: string, resource: string): Promise<boolean> {
    try {
      return await ZeroTrustSecurityService.getInstance().validateAccess(userId, resource);
    } catch (error) {
      console.error('Access validation failed:', error);
      return false; // Fail secure
    }
  }
}
