
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  from: string;
  to?: string;
  data?: any;
  timestamp: string;
}

export class StageSignalingService {
  private static instance: StageSignalingService;
  private channel: RealtimeChannel | null = null;
  private stageId: string | null = null;
  private userId: string | null = null;
  private messageHandlers: Map<string, (message: SignalingMessage) => void> = new Map();

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

      // Create a unique channel for this stage
      this.channel = supabase.channel(`stage-${stageId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: userId }
        }
      });

      // Listen for broadcast messages
      this.channel.on('broadcast', { event: 'signaling' }, (payload) => {
        const message = payload.payload as SignalingMessage;
        this.handleIncomingMessage(message);
      });

      // Listen for presence changes
      this.channel.on('presence', { event: 'sync' }, () => {
        const presenceState = this.channel?.presenceState();
        console.log('Presence sync:', presenceState);
      });

      this.channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        this.handleUserJoined(key);
      });

      this.channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        this.handleUserLeft(key);
      });

      // Subscribe to the channel
      const subscriptionResult = await this.channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Channel subscribed successfully');
          // Track presence
          await this.channel?.track({
            user_id: userId,
            online_at: new Date().toISOString()
          });
        }
      });

      return subscriptionResult === 'SUBSCRIBED';
    } catch (error) {
      console.error('Error joining stage signaling:', error);
      return false;
    }
  }

  async leaveStage(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }
    this.stageId = null;
    this.userId = null;
    this.messageHandlers.clear();
  }

  async sendSignalingMessage(message: Omit<SignalingMessage, 'from' | 'timestamp'>): Promise<void> {
    if (!this.channel || !this.userId) {
      console.error('Not connected to signaling channel');
      return;
    }

    const fullMessage: SignalingMessage = {
      ...message,
      from: this.userId,
      timestamp: new Date().toISOString()
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: fullMessage
    });
  }

  onMessage(type: string, handler: (message: SignalingMessage) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private handleIncomingMessage(message: SignalingMessage): void {
    // Don't handle our own messages
    if (message.from === this.userId) return;

    // Only handle messages directed to us or broadcast messages
    if (message.to && message.to !== this.userId) return;

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
        data: { userId: this.userId }
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

  getConnectedUsers(): string[] {
    if (!this.channel) return [];
    
    const presenceState = this.channel.presenceState();
    return Object.keys(presenceState);
  }
}

// Export as default for compatibility
export default StageSignalingService.getInstance();
