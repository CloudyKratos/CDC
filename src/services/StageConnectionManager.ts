
import { StageSignalingService } from './StageSignalingService';
import EnhancedStageWebRTCService from './EnhancedStageWebRTCService';
import StageMediaService from './StageMediaService';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnectionTime: Date | null;
}

interface ConnectionQuality {
  ping: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class StageConnectionManager {
  private static instance: StageConnectionManager;
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnectionTime: null
  };
  private connectionQuality: ConnectionQuality = {
    ping: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0,
    quality: 'good'
  };
  private stageId: string | null = null;
  private userId: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private qualityCheckInterval: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): StageConnectionManager {
    if (!StageConnectionManager.instance) {
      StageConnectionManager.instance = new StageConnectionManager();
    }
    return StageConnectionManager.instance;
  }

  async connectToStage(stageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (this.connectionState.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.stageId = stageId;
    this.userId = userId;
    this.connectionState.isConnecting = true;
    this.connectionState.error = null;

    try {
      // Initialize media first
      const mediaService = StageMediaService.getInstance();
      const localStream = await mediaService.initializeMedia();

      // Connect signaling
      const signalingConnected = await StageSignalingService.joinStage(stageId, userId);
      if (!signalingConnected) {
        throw new Error('Failed to connect to signaling server');
      }

      // Initialize WebRTC with enhanced error handling
      await EnhancedStageWebRTCService.initialize(localStream, {
        onRemoteStream: (userId, stream) => this.emit('remoteStream', { userId, stream }),
        onConnectionStateChange: (userId, state) => this.handleConnectionStateChange(userId, state),
        onUserDisconnected: (userId) => this.emit('userDisconnected', { userId })
      });

      // Connect to existing users
      await EnhancedStageWebRTCService.connectToExistingUsers();

      this.connectionState.isConnected = true;
      this.connectionState.isConnecting = false;
      this.connectionState.lastConnectionTime = new Date();
      this.connectionState.reconnectAttempts = 0;

      // Start quality monitoring
      this.startQualityMonitoring();

      this.emit('connected', { stageId, userId });
      console.log('Successfully connected to stage:', stageId);

      return { success: true };
    } catch (error) {
      this.connectionState.isConnecting = false;
      this.connectionState.error = error instanceof Error ? error.message : 'Connection failed';
      
      console.error('Connection error:', error);
      this.emit('connectionError', { error: this.connectionState.error });

      return { success: false, error: this.connectionState.error };
    }
  }

  async disconnectFromStage(): Promise<void> {
    try {
      // Stop quality monitoring
      this.stopQualityMonitoring();

      // Stop reconnection attempts
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Cleanup WebRTC
      EnhancedStageWebRTCService.cleanup();

      // Leave signaling
      await StageSignalingService.leaveStage();

      // Cleanup media
      StageMediaService.getInstance().cleanup();

      this.connectionState.isConnected = false;
      this.connectionState.isConnecting = false;
      this.connectionState.error = null;
      this.connectionState.reconnectAttempts = 0;

      this.emit('disconnected', {});
      console.log('Disconnected from stage');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  private handleConnectionStateChange(userId: string, state: RTCPeerConnectionState): void {
    console.log(`Connection state changed for ${userId}:`, state);

    if (state === 'failed' || state === 'disconnected') {
      this.attemptReconnection();
    }

    this.emit('connectionStateChange', { userId, state });
  }

  private async attemptReconnection(): Promise<void> {
    if (!this.stageId || !this.userId || this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      this.connectionState.error = 'Maximum reconnection attempts reached';
      this.emit('connectionError', { error: this.connectionState.error });
      return;
    }

    this.connectionState.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts - 1); // Exponential backoff

    console.log(`Attempting reconnection ${this.connectionState.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.disconnectFromStage();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit before reconnecting
        await this.connectToStage(this.stageId!, this.userId!);
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnection(); // Try again
      }
    }, delay);
  }

  private startQualityMonitoring(): void {
    this.qualityCheckInterval = setInterval(() => {
      this.checkConnectionQuality();
    }, 5000); // Check every 5 seconds
  }

  private stopQualityMonitoring(): void {
    if (this.qualityCheckInterval) {
      clearInterval(this.qualityCheckInterval);
      this.qualityCheckInterval = null;
    }
  }

  private async checkConnectionQuality(): Promise<void> {
    try {
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

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  getConnectionQuality(): ConnectionQuality {
    return { ...this.connectionQuality };
  }

  // Event system
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
}

export default StageConnectionManager.getInstance();
