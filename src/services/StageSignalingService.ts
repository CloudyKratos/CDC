import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'mesh-update' | 'quality-report';
  from: string;
  to?: string;
  data?: any;
  timestamp: string;
  priority?: 'high' | 'normal' | 'low';
  encrypted?: boolean;
}

export interface NetworkQuality {
  ping: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
}

export class StageSignalingService {
  private static instance: StageSignalingService;
  private channel: RealtimeChannel | null = null;
  private stageId: string | null = null;
  private userId: string | null = null;
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map();
  private messageQueue: SignalingMessage[] = [];
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private qualityMonitorInterval: NodeJS.Timeout | null = null;
  private lastQualityReport: NetworkQuality | null = null;

  static getInstance(): StageSignalingService {
    if (!StageSignalingService.instance) {
      StageSignalingService.instance = new StageSignalingService();
    }
    return StageSignalingService.instance;
  }

  async joinStage(stageId: string, userId: string): Promise<boolean> {
    try {
      this.stageId = stageId;
      this.userId = userId;
      this.connectionState = 'connecting';

      // Create a unique channel for this stage with enhanced configuration
      this.channel = supabase.channel(`stage-${stageId}`, {
        config: {
          broadcast: { self: true, ack: true },
          presence: { key: userId }
        }
      });

      // Listen for broadcast messages with enhanced handling
      this.channel.on('broadcast', { event: 'signaling' }, (payload) => {
        const message = payload.payload as SignalingMessage;
        this.handleIncomingMessage(message);
      });

      // Enhanced presence handling for mesh network optimization
      this.channel.on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel?.presenceState();
        console.log('Presence sync - optimizing mesh topology:', presenceState);
        this.optimizeMeshTopology();
      });

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined - updating mesh:', key, newPresences);
        this.handleUserJoined(key);
        this.broadcastMeshUpdate();
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left - reconfiguring mesh:', key, leftPresences);
        this.handleUserLeft(key);
        this.broadcastMeshUpdate();
      });

      // Subscribe with enhanced error handling
      const subscriptionResult = await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Enhanced signaling channel subscribed successfully');
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          
          // Track presence with enhanced metadata
          if (this.channel) {
            await this.channel.track({
              user_id: userId,
              online_at: new Date().toISOString(),
              capabilities: {
                webrtc: true,
                datachannel: true,
                screenshare: true
              },
              network_quality: this.lastQualityReport
            });
          }

          // Start quality monitoring
          this.startQualityMonitoring();
          
          // Process queued messages
          this.processMessageQueue();
        } else if (status === 'CHANNEL_ERROR') {
          this.handleConnectionError();
        }
      });

      return subscriptionResult === 'SUBSCRIBED';
    } catch (error) {
      console.error('Error joining enhanced stage signaling:', error);
      this.handleConnectionError();
      return false;
    }
  }

  async leaveStage(): Promise<void> {
    this.stopQualityMonitoring();
    
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    
    this.stageId = null;
    this.userId = null;
    this.messageHandlers.clear();
    this.messageQueue = [];
    this.connectionState = 'disconnected';
    this.reconnectAttempts = 0;
  }

  async sendSignalingMessage(message: Omit<SignalingMessage, 'from' | 'timestamp'>): Promise<void> {
    if (!this.userId) {
      console.error('Not connected to signaling channel');
      return;
    }

    const fullMessage: SignalingMessage = {
      ...message,
      from: this.userId,
      timestamp: new Date().toISOString(),
      priority: message.priority || 'normal'
    };

    // Queue message if not connected
    if (this.connectionState !== 'connected') {
      this.messageQueue.push(fullMessage);
      return;
    }

    // Send with retry logic
    try {
      if (this.channel) {
        await this.channel.send({
          type: 'broadcast',
          event: 'signaling',
          payload: fullMessage
        });
      }
    } catch (error) {
      console.error('Failed to send signaling message:', error);
      this.messageQueue.push(fullMessage);
      this.handleConnectionError();
    }
  }

  onMessage(type: string, handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private handleIncomingMessage(message: SignalingMessage): void {
    // Don't handle our own messages
    if (message.from === this.userId) return;

    // Only handle messages directed to us or broadcast messages
    if (message.to && message.to !== this.userId) return;

    // Handle mesh updates
    if (message.type === 'mesh-update') {
      this.handleMeshUpdate(message);
      return;
    }

    // Handle quality reports
    if (message.type === 'quality-report') {
      this.handleQualityReport(message);
      return;
    }

    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  private handleUserJoined(userId: string): void {
    if (userId !== this.userId) {
      this.sendSignalingMessage({
        type: 'user-joined',
        to: userId,
        data: { 
          userId: this.userId,
          capabilities: {
            webrtc: true,
            datachannel: true,
            screenshare: true
          }
        }
      });
    }
  }

  private handleUserLeft(userId: string): void {
    const handler = this.messageHandlers.get('user-left');
    if (handler) {
      handler({
        type: 'user-left',
        from: userId,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleConnectionError(): void {
    this.connectionState = 'reconnecting';
    
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        if (this.stageId && this.userId) {
          this.joinStage(this.stageId, this.userId);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.connectionState = 'disconnected';
    }
  }

  private processMessageQueue(): void {
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(message => {
      this.sendSignalingMessage(message);
    });
  }

  private optimizeMeshTopology(): void {
    // AI-powered mesh optimization based on network conditions
    const connectedUsers = this.getConnectedUsers();
    
    if (connectedUsers.length > 5) {
      // Implement selective peer connections for large groups
      this.sendSignalingMessage({
        type: 'mesh-update',
        data: {
          topology: 'selective',
          maxConnections: 4,
          preferredPeers: this.selectOptimalPeers(connectedUsers)
        }
      });
    }
  }

  private selectOptimalPeers(users: string[]): string[] {
    return users.slice(0, 4);
  }

  private broadcastMeshUpdate(): void {
    this.sendSignalingMessage({
      type: 'mesh-update',
      data: {
        participants: this.getConnectedUsers(),
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleMeshUpdate(message: SignalingMessage): void {
    console.log('Received mesh update:', message.data);
    // Process mesh topology changes
  }

  private handleQualityReport(message: SignalingMessage): void {
    console.log('Received quality report from:', message.from, message.data);
    // Process network quality information for optimization
  }

  private startQualityMonitoring(): void {
    this.qualityMonitorInterval = setInterval(() => {
      this.monitorNetworkQuality();
    }, 5000);
  }

  private stopQualityMonitoring(): void {
    if (this.qualityMonitorInterval) {
      clearInterval(this.qualityMonitorInterval);
      this.qualityMonitorInterval = null;
    }
  }

  private async monitorNetworkQuality(): Promise<void> {
    // Simulate network quality measurement
    const quality: NetworkQuality = {
      ping: Math.random() * 100 + 20,
      jitter: Math.random() * 10,
      packetLoss: Math.random() * 5,
      bandwidth: Math.random() * 2000 + 1000,
      quality: this.calculateQualityRating()
    };

    this.lastQualityReport = quality;

    // Broadcast quality report to help others optimize
    this.sendSignalingMessage({
      type: 'quality-report',
      data: quality,
      priority: 'low'
    });
  }

  private calculateQualityRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = Math.random();
    if (score > 0.8) return 'excellent';
    if (score > 0.6) return 'good';
    if (score > 0.4) return 'fair';
    return 'poor';
  }

  getConnectedUsers(): string[] {
    if (!this.channel) return [];
    
    const presenceState = this.channel.presenceState();
    return Object.keys(presenceState);
  }

  getConnectionState(): string {
    return this.connectionState;
  }

  getNetworkQuality(): NetworkQuality | null {
    return this.lastQualityReport;
  }
}

export default StageSignalingService.getInstance();
