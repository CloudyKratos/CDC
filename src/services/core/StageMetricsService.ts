
import { PerformanceOptimizationService } from '../performance/PerformanceOptimizationService';
import { ZeroTrustSecurityService } from '../security/ZeroTrustSecurityService';
import { CircuitBreakerService } from '../reliability/CircuitBreakerService';
import { ComplianceFrameworkService } from '../compliance/ComplianceFrameworkService';
import { StageConfig } from './types/StageTypes';

export class StageMetricsService {
  getPerformanceMetrics(): any {
    return PerformanceOptimizationService.getInstance().getLatestMetrics();
  }

  getSecurityMetrics(currentStage: StageConfig | null): any {
    if (!currentStage) return null;

    return {
      securityContext: ZeroTrustSecurityService.getInstance().getSecurityContext(currentStage.userId),
      threats: ZeroTrustSecurityService.getInstance().getThreatDetections(currentStage.userId),
      circuitBreakerStates: CircuitBreakerService.getInstance().getAllCircuits()
    };
  }

  getComplianceMetrics(currentStage: StageConfig | null): any {
    if (!currentStage) return null;

    const endDate = Date.now();
    const startDate = endDate - (24 * 60 * 60 * 1000);

    return ComplianceFrameworkService.getInstance().generateGDPRReport(startDate, endDate);
  }
}
