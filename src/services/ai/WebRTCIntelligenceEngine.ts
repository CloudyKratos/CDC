export interface ConnectionMetrics {
  ping: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  cpuUsage: number;
  memoryUsage: number;
}

export interface PeerOptimizationData {
  userId: string;
  metrics: ConnectionMetrics;
  priority: number;
  reliability: number;
}

export class WebRTCIntelligenceEngine {
  private static instance: WebRTCIntelligenceEngine;
  private connectionHistory: Map<string, ConnectionMetrics[]> = new Map();
  private predictionModel: any = null; // TensorFlow.js model would go here
  
  static getInstance(): WebRTCIntelligenceEngine {
    if (!WebRTCIntelligenceEngine.instance) {
      WebRTCIntelligenceEngine.instance = new WebRTCIntelligenceEngine();
    }
    return WebRTCIntelligenceEngine.instance;
  }

  // AI-powered peer selection for optimal mesh topology
  selectOptimalPeers(availablePeers: PeerOptimizationData[], maxConnections: number): string[] {
    // Sort peers by reliability and performance metrics
    const sortedPeers = availablePeers.sort((a, b) => {
      const scoreA = this.calculatePeerScore(a);
      const scoreB = this.calculatePeerScore(b);
      return scoreB - scoreA;
    });

    return sortedPeers.slice(0, maxConnections).map(peer => peer.userId);
  }

  // Predictive connection quality assessment
  predictConnectionQuality(userId: string, currentMetrics: ConnectionMetrics): number {
    const history = this.connectionHistory.get(userId) || [];
    
    if (history.length < 3) {
      return 0.7; // Default moderate score for new connections
    }

    // Simple trend analysis (in production, use ML model)
    const recentMetrics = history.slice(-5);
    const avgPing = recentMetrics.reduce((sum, m) => sum + m.ping, 0) / recentMetrics.length;
    const avgPacketLoss = recentMetrics.reduce((sum, m) => sum + m.packetLoss, 0) / recentMetrics.length;
    
    // Predictive score based on trends
    const trendScore = this.calculateTrendScore(currentMetrics, { ping: avgPing, packetLoss: avgPacketLoss });
    return Math.max(0, Math.min(1, trendScore));
  }

  // Adaptive bitrate recommendation
  recommendBitrate(metrics: ConnectionMetrics): number {
    const { bandwidth, packetLoss, ping } = metrics;
    
    // AI algorithm for optimal bitrate selection
    let baseBitrate = Math.min(bandwidth * 0.8, 2500000); // 80% of available bandwidth, max 2.5Mbps
    
    // Adjust for packet loss
    if (packetLoss > 2) {
      baseBitrate *= (1 - packetLoss / 100);
    }
    
    // Adjust for latency
    if (ping > 150) {
      baseBitrate *= 0.8;
    }
    
    return Math.max(250000, baseBitrate); // Minimum 250kbps
  }

  // Smart codec selection based on content and network
  recommendCodec(contentType: 'voice' | 'presentation' | 'video', metrics: ConnectionMetrics): string {
    const { bandwidth, cpuUsage } = metrics;
    
    if (contentType === 'voice') {
      return bandwidth > 100000 ? 'opus' : 'g722';
    }
    
    if (contentType === 'presentation') {
      return cpuUsage < 70 ? 'h264' : 'vp8';
    }
    
    // Video content
    if (bandwidth > 1500000 && cpuUsage < 60) {
      return 'h264';
    } else if (bandwidth > 800000) {
      return 'vp8';
    } else {
      return 'vp9'; // Better compression for low bandwidth
    }
  }

  // Proactive reconnection strategy
  shouldAttemptReconnection(userId: string, failureCount: number): boolean {
    const history = this.connectionHistory.get(userId);
    if (!history || history.length < 2) {
      return failureCount < 3; // Conservative approach for new peers
    }
    
    const reliability = this.calculateReliability(history);
    const maxAttempts = reliability > 0.8 ? 5 : 3;
    
    return failureCount < maxAttempts;
  }

  // Update connection metrics for learning
  updateMetrics(userId: string, metrics: ConnectionMetrics): void {
    const history = this.connectionHistory.get(userId) || [];
    history.push(metrics);
    
    // Keep only last 50 measurements
    if (history.length > 50) {
      history.shift();
    }
    
    this.connectionHistory.set(userId, history);
  }

  private calculatePeerScore(peer: PeerOptimizationData): number {
    const { metrics, reliability, priority } = peer;
    
    // Weighted scoring algorithm
    const pingScore = Math.max(0, 1 - metrics.ping / 500); // Lower ping is better
    const bandwidthScore = Math.min(1, metrics.bandwidth / 2000000); // Normalize to 2Mbps
    const lossScore = Math.max(0, 1 - metrics.packetLoss / 10); // Lower loss is better
    const cpuScore = Math.max(0, 1 - metrics.cpuUsage / 100); // Lower CPU usage is better
    
    return (
      pingScore * 0.3 +
      bandwidthScore * 0.3 +
      lossScore * 0.2 +
      reliability * 0.15 +
      priority * 0.05
    );
  }

  private calculateTrendScore(current: ConnectionMetrics, historical: { ping: number; packetLoss: number }): number {
    const pingTrend = historical.ping > 0 ? current.ping / historical.ping : 1;
    const lossTrend = historical.packetLoss > 0 ? current.packetLoss / historical.packetLoss : 1;
    
    // Better if current metrics are improving (lower values)
    const trendScore = 2 - (pingTrend + lossTrend) / 2;
    return Math.max(0, Math.min(1, trendScore));
  }

  private calculateReliability(history: ConnectionMetrics[]): number {
    if (history.length < 5) return 0.5;
    
    // Calculate stability over time
    const pingVariance = this.calculateVariance(history.map(h => h.ping));
    const lossVariance = this.calculateVariance(history.map(h => h.packetLoss));
    
    // Lower variance indicates higher reliability
    const reliabilityScore = 1 - Math.min(1, (pingVariance + lossVariance) / 10000);
    return Math.max(0, reliabilityScore);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }
}

export default WebRTCIntelligenceEngine.getInstance();
