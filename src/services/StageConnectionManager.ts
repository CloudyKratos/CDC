
import StageSignalingService from './StageSignalingService';
import EnhancedStageWebRTCService from './EnhancedStageWebRTCService';
import { StageMediaService } from './StageMediaService';
import { ConnectionQualityMonitor } from './core/connection/ConnectionQualityMonitor';
import { ReconnectionManager } from './core/connection/ReconnectionManager';
import { ConnectionStateManager } from './core/connection/ConnectionStateManager';

export class StageConnectionManager {
  private static instance: StageConnectionManager;
  private stateManager = new ConnectionStateManager();
  private qualityMonitor = new ConnectionQualityMonitor();
  private reconnectionManager = new ReconnectionManager();
  private stageId: string | null = null;
  private userId: string | null = null;

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): StageConnectionManager {
    if (!StageConnectionManager.instance) {
      StageConnectionManager.instance = new StageConnectionManager();
    }
    return StageConnectionManager.instance;
  }

  async connectToStage(stageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    const currentState = this.stateManager.getConnectionState();
    
    if (currentState.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.stageId = stageId;
    this.userId = userId;
    this.stateManager.markConnecting();

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

      this.stateManager.markConnected();

      // Start quality monitoring
      this.qualityMonitor.startQualityMonitoring();
      this.qualityMonitor.on('qualityUpdate', (data) => this.emit('qualityUpdate', data));

      this.emit('connected', { stageId, userId });
      console.log('Successfully connected to stage:', stageId);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      this.stateManager.markError(errorMessage);
      
      console.error('Connection error:', error);
      this.emit('connectionError', { error: errorMessage });

      return { success: false, error: errorMessage };
    }
  }

  async disconnectFromStage(): Promise<void> {
    try {
      // Stop quality monitoring
      this.qualityMonitor.stopQualityMonitoring();

      // Stop reconnection attempts
      this.reconnectionManager.cancelReconnection();

      // Cleanup WebRTC
      EnhancedStageWebRTCService.cleanup();

      // Leave signaling
      await StageSignalingService.leaveStage();

      // Cleanup media
      StageMediaService.getInstance().cleanup();

      this.stateManager.markDisconnected();

      this.emit('disconnected', {});
      console.log('Disconnected from stage');
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  private handleConnectionStateChange(userId: string, state: RTCPeerConnectionState): void {
    console.log(`Connection state changed for ${userId}:`, state);

    if (state === 'failed' || state === 'disconnected') {
      this.stateManager.incrementReconnectAttempts();
      const currentState = this.stateManager.getConnectionState();
      
      this.reconnectionManager.attemptReconnection(
        this.stageId,
        this.userId,
        currentState.reconnectAttempts,
        (stageId, userId) => this.connectToStage(stageId, userId),
        () => this.disconnectFromStage()
      );
    }

    this.emit('connectionStateChange', { userId, state });
  }

  getConnectionState() {
    return this.stateManager.getConnectionState();
  }

  getConnectionQuality() {
    return this.qualityMonitor.getConnectionQuality();
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

  cleanup(): void {
    this.qualityMonitor.cleanup();
    this.reconnectionManager.cleanup();
    this.stateManager.markDisconnected();
    this.eventListeners.clear();
  }
}

export default StageConnectionManager.getInstance();
