
interface ConnectionQuality {
  ping: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class ConnectionQualityMonitor {
  private qualityCheckInterval: NodeJS.Timeout | null = null;
  private connectionQuality: ConnectionQuality = {
    ping: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0,
    quality: 'good'
  };
  private eventListeners: Map<string, Function[]> = new Map();

  startQualityMonitoring(): void {
    this.qualityCheckInterval = setInterval(() => {
      this.checkConnectionQuality();
    }, 5000); // Check every 5 seconds
  }

  stopQualityMonitoring(): void {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }
  }

  private async checkConnectionQuality(): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { default: EnhancedStageWebRTCService } = await import('../../EnhancedStageWebRTCService');
      const connections = EnhancedStageWebRTCService.getConnectionStates();
      let totalPing = 0;
      let connectedCount = 0;

      for (const [userId, state] of connections) {
        if (state === 'connected') {
          connectedCount++;
          // In a real implementation, you'd get actual stats from the peer connection
          // For now, we'll simulate some quality metrics
          totalPing += Math.random() * 100 + 50; // 50-150ms ping simulation
        }
      }

      if (connectedCount > 0) {
        this.connectionQuality.ping = totalPing / connectedCount;
        this.connectionQuality.jitter = Math.random() * 10; // 0-10ms jitter
        this.connectionQuality.packetLoss = Math.random() * 5; // 0-5% packet loss
        this.connectionQuality.bandwidth = 1000 + Math.random() * 2000; // 1-3 Mbps

        // Determine quality based on metrics
        if (this.connectionQuality.ping < 100 && this.connectionQuality.packetLoss < 1) {
          this.connectionQuality.quality = 'excellent';
        } else if (this.connectionQuality.ping < 200 && this.connectionQuality.packetLoss < 3) {
          this.connectionQuality.quality = 'good';
        } else if (this.connectionQuality.ping < 300 && this.connectionQuality.packetLoss < 5) {
          this.connectionQuality.quality = 'fair';
        } else {
          this.connectionQuality.quality = 'poor';
        }

        this.emit('qualityUpdate', { quality: this.connectionQuality });
      }
    } catch (error) {
      console.error('Error checking connection quality:', error);
    }
  }

  getConnectionQuality(): ConnectionQuality {
    return { ...this.connectionQuality };
  }

  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  cleanup(): void {
    this.stopQualityMonitoring();
    this.eventListeners.clear();
  }
}
