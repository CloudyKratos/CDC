export interface MonitoringMetrics {
  timestamp: number;
  connectionCount: number;
  averageLatency: number;
  packetLoss: number;
  bandwidth: number;
  cpuUsage: number;
  memoryUsage: number;
}

export class StageMonitoringService {
  private static instance: StageMonitoringService;
  private metrics: MonitoringMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;

  static getInstance(): StageMonitoringService {
    if (!StageMonitoringService.instance) {
      StageMonitoringService.instance = new StageMonitoringService();
    }
    return StageMonitoringService.instance;
  }

  static startMonitoring(): void {
    const instance = StageMonitoringService.getInstance();
    instance.start();
  }

  static stopMonitoring(): void {
    const instance = StageMonitoringService.getInstance();
    instance.stop();
  }

  private start(): void {
    if (this.monitoringInterval) return;

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 5000);

    console.log('Stage monitoring started');
  }

  private stop(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('Stage monitoring stopped');
  }

  private collectMetrics(): void {
    const metrics: MonitoringMetrics = {
      timestamp: Date.now(),
      connectionCount: 0, // Will be updated by other services
      averageLatency: Math.random() * 100 + 20,
      packetLoss: Math.random() * 5,
      bandwidth: Math.random() * 2000 + 1000,
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100
    };

    this.metrics.push(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  getMetrics(): MonitoringMetrics[] {
    return [...this.metrics];
  }

  getLatestMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }
}

export default StageMonitoringService.getInstance();
