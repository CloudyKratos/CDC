import { supabase } from '@/integrations/supabase/client';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  fromUserId: string;
  toUserId?: string;
  data?: any;
  stageId: string;
  timestamp: number;
}

class StageSignalingService {
  private static instance: StageSignalingService;
  private currentStageId: string | null = null;
  private currentUserId: string | null = null;
  private messageHandlers: Map<string, Function> = new Map();
  private connectedUsers: Set<string> = new Set();
  private isInitialized = false;

  static getInstance(): StageSignalingService {
    if (!StageSignalingService.instance) {
      StageSignalingService.instance = new StageSignalingService();
    }
    return StageSignalingService.instance;
  }

  async joinStage(stageId: string, userId: string, userName: string): Promise<void> {
    console.log('📡 Joining signaling for stage:', stageId);
    
    this.currentStageId = stageId;
    this.currentUserId = userId;
    
    // Set up realtime subscription for signaling messages
    const channel = supabase.channel(`signaling:${stageId}`)
      .on('broadcast', { event: 'signaling' }, (payload) => {
        this.handleSignalingMessage(payload.payload as SignalingMessage);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Signaling channel subscribed');
          
          // Announce that we joined
          await this.broadcastMessage({
            type: 'user-joined',
            fromUserId: userId,
            stageId,
            timestamp: Date.now(),
            data: { name: userName }
          });
          
          this.isInitialized = true;
        }
      });
  }

  async leaveStage(stageId: string): Promise<void> {
    if (!this.currentUserId || !this.currentStageId) return;
    
    console.log('📡 Leaving signaling for stage:', stageId);
    
    // Announce that we're leaving
    await this.broadcastMessage({
      type: 'user-left',
      fromUserId: this.currentUserId,
      stageId: this.currentStageId,
      timestamp: Date.now()
    });
    
    // Clean up
    supabase.removeAllChannels();
    this.currentStageId = null;
    this.currentUserId = null;
    this.connectedUsers.clear();
    this.messageHandlers.clear();
    this.isInitialized = false;
  }

  private async broadcastMessage(message: SignalingMessage): Promise<void> {
    if (!this.currentStageId) return;
    
    const channel = supabase.channel(`signaling:${this.currentStageId}`);
    await channel.send({
      type: 'broadcast',
      event: 'signaling',
      payload: message
    });
  }

  async sendOffer(toUserId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.currentStageId || !this.currentUserId) return;
    
    console.log('📤 Sending offer to:', toUserId);
    await this.broadcastMessage({
      type: 'offer',
      fromUserId: this.currentUserId,
      toUserId,
      stageId: this.currentStageId,
      data: offer,
      timestamp: Date.now()
    });
  }

  async sendAnswer(toUserId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.currentStageId || !this.currentUserId) return;
    
    console.log('📤 Sending answer to:', toUserId);
    await this.broadcastMessage({
      type: 'answer',
      fromUserId: this.currentUserId,
      toUserId,
      stageId: this.currentStageId,
      data: answer,
      timestamp: Date.now()
    });
  }

  async sendIceCandidate(toUserId: string, candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.currentStageId || !this.currentUserId) return;
    
    await this.broadcastMessage({
      type: 'ice-candidate',
      fromUserId: this.currentUserId,
      toUserId,
      stageId: this.currentStageId,
      data: candidate,
      timestamp: Date.now()
    });
  }

  onMessage(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler);
  }

  private handleSignalingMessage(message: SignalingMessage): void {
    // Ignore our own messages
    if (message.fromUserId === this.currentUserId) return;
    
    console.log('📥 Received signaling message:', message.type, 'from:', message.fromUserId);
    
    // Track connected users
    if (message.type === 'user-joined') {
      this.connectedUsers.add(message.fromUserId);
    } else if (message.type === 'user-left') {
      this.connectedUsers.delete(message.fromUserId);
    }
    
    // Call registered handler
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers);
  }

  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  isReady(): boolean {
    return this.isInitialized && this.currentStageId !== null && this.currentUserId !== null;
  }
}

export { StageSignalingService };
export default StageSignalingService.getInstance();