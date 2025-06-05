
import { ServiceRegistry } from './ServiceRegistry';
import StageSignalingService from '../StageSignalingService';
import { NextGenWebRTCService } from '../NextGenWebRTCService';
import { StageMonitoringService } from '../monitoring/StageMonitoringService';
import { CircuitBreakerService } from '../reliability/CircuitBreakerService';
import { PerformanceOptimizationService } from '../performance/PerformanceOptimizationService';
import { ZeroTrustSecurityService } from '../security/ZeroTrustSecurityService';
import { ComplianceFrameworkService } from '../compliance/ComplianceFrameworkService';
import { QuantumResistantSecurity } from '../security/QuantumResistantSecurity';

export class StageServiceInitializer {
  private serviceRegistry = ServiceRegistry.getInstance();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing Stage Orchestrator with enterprise services...');

    try {
      // Register all services
      this.serviceRegistry.registerService('signaling', StageSignalingService);
      this.serviceRegistry.registerService('webrtc', NextGenWebRTCService.getInstance());
      this.serviceRegistry.registerService('monitoring', StageMonitoringService.getInstance());
      this.serviceRegistry.registerService('circuit-breaker', CircuitBreakerService.getInstance());
      this.serviceRegistry.registerService('performance', PerformanceOptimizationService.getInstance());
      this.serviceRegistry.registerService('security', ZeroTrustSecurityService.getInstance());
      this.serviceRegistry.registerService('compliance', ComplianceFrameworkService.getInstance());
      this.serviceRegistry.registerService('quantum-security', QuantumResistantSecurity.getInstance());

      // Initialize critical services
      await QuantumResistantSecurity.getInstance().initialize();
      await PerformanceOptimizationService.getInstance().initialize();
      await ZeroTrustSecurityService.initialize();
      await ComplianceFrameworkService.getInstance().initialize();

      // Start monitoring
      StageMonitoringService.startMonitoring();

      this.isInitialized = true;
      console.log('Stage Orchestrator initialized successfully with military-grade security');

    } catch (error) {
      console.error('Failed to initialize Stage Orchestrator:', error);
      throw error;
    }
  }

  getServiceHealth(): { [key: string]: boolean } {
    return this.serviceRegistry.getHealthStatus();
  }

  async emergencyShutdown(): Promise<void> {
    console.log('Initiating emergency shutdown...');

    try {
      StageMonitoringService.stopMonitoring();
      NextGenWebRTCService.cleanup();
      await StageSignalingService.leaveStage();
      PerformanceOptimizationService.getInstance().cleanup();
      ZeroTrustSecurityService.getInstance().cleanup();
      QuantumResistantSecurity.getInstance().cleanup();

      console.log('Emergency shutdown completed');
    } catch (error) {
      console.error('Error during emergency shutdown:', error);
    }
  }

  cleanup(): void {
    this.serviceRegistry.cleanup();
    this.isInitialized = false;
    console.log('Stage Service Initializer cleanup completed');
  }
}
