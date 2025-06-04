export interface PerformanceMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  frameRate: number;
  audioLevel: number;
  connectionCount: number;
  timestamp: number;
}

export interface HealthCheck {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  lastCheck: Date;
  errorCount: number;
}

export interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  service: string;
}

export class StageMonitoringService {
  private static instance: StageMonitoringService;
  private performanceHistory: PerformanceMetrics[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private alerts: Alert[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  
  // Thresholds for alerting
  private thresholds = {
    cpuUsage: 80,
    memoryUsage: 85,
    networkLatency: 200,
    frameRate: 20,
    audioLevel: -40,
    connectionFailureRate: 0.1
  };

  static getInstance(): StageMonitoringService {
    if (!StageMonitoringService.instance) {
      StageMonitoringService.instance = new StageMonitoringService();
    }
    return StageMonitoringService.instance;
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.performHealthChecks();
      this.analyzeMetrics();
    }, 5000); // Collect metrics every 5 seconds

    console.log('Stage monitoring service started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Stage monitoring service stopped');
  }

  private async collectMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        cpuUsage: await this.getCPUUsage(),
        memoryUsage: this.getMemoryUsage(),
        networkLatency: await this.getNetworkLatency(),
        frameRate: await this.getFrameRate(),
        audioLevel: await this.getAudioLevel(),
        connectionCount: this.getConnectionCount(),
        timestamp: Date.now()
      };

      this.performanceHistory.push(metrics);
      
      // Keep only last 100 measurements (about 8 minutes)
      if (this.performanceHistory.length > 100) {
        this.performanceHistory.shift();
      }

      console.log('Metrics collected:', metrics);
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  private async getCPUUsage(): Promise<number> {
    // Simplified CPU usage calculation
    // In production, would use more sophisticated measurement
    const start = performance.now();
    
    // Simulate CPU-intensive task
    for (let i = 0; i < 100000; i++) {
      Math.random();
    }
    
    const duration = performance.now() - start;
    return Math.min(100, duration * 2); // Rough approximation
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100;
    }
    return 0;
  }

  private async getNetworkLatency(): Promise<number> {
    try {
      const start = performance.now();
      
      // Ping a reliable endpoint
      await fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return performance.now() - start;
    } catch (error) {
      return 999; // High latency if ping fails
    }
  }

  private getFrameRate(): number {
    // Simplified frame rate calculation
    // In production, would measure actual video frame rate
    return 30 + Math.random() * 10; // Simulate 30-40 FPS
  }

  private getAudioLevel(): number {
    // Simplified audio level measurement
    // In production, would use Web Audio API to measure actual levels
    return -20 + Math.random() * 10; // Simulate -20 to -10 dB
  }

  private getConnectionCount(): number {
    // Would get actual connection count from WebRTC service
    return Math.floor(Math.random() * 10);
  }

  private async performHealthChecks(): Promise<void> {
    const services = [
      'signaling',
      'webrtc',
      'media',
      'security',
      'storage'
    ];

    for (const service of services) {
      await this.checkServiceHealth(service);
    }
  }

  private async checkServiceHealth(serviceName: string): Promise<void> {
    const start = performance.now();
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let errorCount = 0;

    try {
      // Simulate health check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      // Randomly simulate some degradation
      if (Math.random() < 0.1) {
        status = 'degraded';
        errorCount = 1;
      } else if (Math.random() < 0.02) {
        status = 'unhealthy';
        errorCount = 3;
      }
    } catch (error) {
      status = 'unhealthy';
      errorCount = 5;
    }

    const latency = performance.now() - start;
    
    const healthCheck: HealthCheck = {
      service: serviceName,
      status,
      latency,
      lastCheck: new Date(),
      errorCount
    };

    this.healthChecks.set(serviceName, healthCheck);

    // Generate alerts for unhealthy services
    if (status === 'unhealthy') {
      this.createAlert('high', `Service ${serviceName} is unhealthy`, serviceName);
    } else if (status === 'degraded') {
      this.createAlert('medium', `Service ${serviceName} is degraded`, serviceName);
    }
  }

  private analyzeMetrics(): void {
    if (this.performanceHistory.length < 5) return;

    const latest = this.performanceHistory[this.performanceHistory.length - 1];
    
    // Check for threshold violations
    if (latest.cpuUsage > this.thresholds.cpuUsage) {
      this.createAlert('high', `High CPU usage: ${latest.cpuUsage.toFixed(1)}%`, 'performance');
    }
    
    if (latest.memoryUsage > this.thresholds.memoryUsage) {
      this.createAlert('high', `High memory usage: ${latest.memoryUsage.toFixed(1)}%`, 'performance');
    }
    
    if (latest.networkLatency > this.thresholds.networkLatency) {
      this.createAlert('medium', `High network latency: ${latest.networkLatency.toFixed(0)}ms`, 'network');
    }
    
    if (latest.frameRate < this.thresholds.frameRate) {
      this.createAlert('medium', `Low frame rate: ${latest.frameRate.toFixed(1)} FPS`, 'media');
    }

    // Analyze trends
    this.analyzeTrends();
  }

  private analyzeTrends(): void {
    if (this.performanceHistory.length < 10) return;

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);

    if (older.length < 10) return;

    // Calculate average metrics for comparison
    const recentAvg = this.calculateAverageMetrics(recent);
    const olderAvg = this.calculateAverageMetrics(older);

    // Check for degrading trends
    if (recentAvg.cpuUsage > olderAvg.cpuUsage * 1.2) {
      this.createAlert('medium', 'CPU usage trending upward', 'performance');
    }
    
    if (recentAvg.memoryUsage > olderAvg.memoryUsage * 1.15) {
      this.createAlert('medium', 'Memory usage trending upward', 'performance');
    }
    
    if (recentAvg.networkLatency > olderAvg.networkLatency * 1.3) {
      this.createAlert('medium', 'Network latency trending upward', 'network');
    }
  }

  private calculateAverageMetrics(metrics: PerformanceMetrics[]): PerformanceMetrics {
    const avg = metrics.reduce((acc, metric) => ({
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      networkLatency: acc.networkLatency + metric.networkLatency,
      frameRate: acc.frameRate + metric.frameRate,
      audioLevel: acc.audioLevel + metric.audioLevel,
      connectionCount: acc.connectionCount + metric.connectionCount,
      timestamp: 0
    }), {
      cpuUsage: 0,
      memoryUsage: 0,
      networkLatency: 0,
      frameRate: 0,
      audioLevel: 0,
      connectionCount: 0,
      timestamp: 0
    });

    const count = metrics.length;
    return {
      cpuUsage: avg.cpuUsage / count,
      memoryUsage: avg.memoryUsage / count,
      networkLatency: avg.networkLatency / count,
      frameRate: avg.frameRate / count,
      audioLevel: avg.audioLevel / count,
      connectionCount: avg.connectionCount / count,
      timestamp: Date.now()
    };
  }

  private createAlert(severity: Alert['severity'], message: string, service: string): void {
    // Check if similar alert already exists and is not resolved
    const existingAlert = this.alerts.find(alert => 
      alert.message === message && 
      alert.service === service && 
      !alert.resolved
    );

    if (existingAlert) {
      return; // Don't create duplicate alerts
    }

    const alert: Alert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      service
    };

    this.alerts.push(alert);
    console.warn(`ALERT [${severity.toUpperCase()}]: ${message}`);

    // Auto-resolve low severity alerts after 5 minutes
    if (severity === 'low') {
      setTimeout(() => {
        this.resolveAlert(alert.id);
      }, 5 * 60 * 1000);
    }
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`Alert resolved: ${alert.message}`);
    }
  }

  // Public interface methods
  getLatestMetrics(): PerformanceMetrics | null {
    return this.performanceHistory.length > 0 
      ? this.performanceHistory[this.performanceHistory.length - 1]
      : null;
  }

  getMetricsHistory(limit?: number): PerformanceMetrics[] {
    const history = [...this.performanceHistory];
    return limit ? history.slice(-limit) : history;
  }

  getHealthChecks(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  getAllAlerts(): Alert[] {
    return [...this.alerts];
  }

  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    console.log('Monitoring thresholds updated:', this.thresholds);
  }

  getThresholds(): typeof this.thresholds {
    return { ...this.thresholds };
  }

  // Generate monitoring report
  generateReport(): {
    summary: string;
    metrics: PerformanceMetrics | null;
    healthStatus: { [key: string]: string };
    activeAlerts: number;
    recommendations: string[];
  } {
    const latest = this.getLatestMetrics();
    const healthChecks = this.getHealthChecks();
    const activeAlerts = this.getActiveAlerts();

    const healthStatus: { [key: string]: string } = {};
    healthChecks.forEach((check, service) => {
      healthStatus[service] = check.status;
    });

    const recommendations: string[] = [];
    
    if (latest) {
      if (latest.cpuUsage > 70) {
        recommendations.push('Consider reducing video quality to lower CPU usage');
      }
      if (latest.memoryUsage > 80) {
        recommendations.push('Browser memory usage is high, consider refreshing the page');
      }
      if (latest.networkLatency > 150) {
        recommendations.push('Network latency is elevated, check internet connection');
      }
    }

    const summary = `Stage monitoring report: ${activeAlerts.length} active alerts, ${Array.from(healthChecks.values()).filter(h => h.status === 'healthy').length}/${healthChecks.size} services healthy`;

    return {
      summary,
      metrics: latest,
      healthStatus,
      activeAlerts: activeAlerts.length,
      recommendations
    };
  }

  cleanup(): void {
    this.stopMonitoring();
    this.performanceHistory = [];
    this.healthChecks.clear();
    this.alerts = [];
    console.log('Stage monitoring service cleaned up');
  }
}

export default StageMonitoringService.getInstance();
