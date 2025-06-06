
import { supabase } from '@/integrations/supabase/client';
import { StageParticipant, ChatMessage } from './core/types/StageTypes';

export class RealTimeStageService {
  private static instance: RealTimeStageService;
  private stageId: string | null = null;
  private participants: Map<string, StageParticipant> = new Map();
  private chatMessages: ChatMessage[] = [];
  private eventHandlers: Map<string, Function[]> = new Map();

  static getInstance(): RealTimeStageService {
    if (!RealTimeStageService.instance) {
      RealTimeStageService.instance = new RealTimeStageService();
    }
    return RealTimeStageService.instance;
  }

  async joinStage(stageId: string, userId: string, userRole: 'speaker' | 'audience' | 'moderator'): Promise<boolean> {
    try {
      this.stageId = stageId;
      
      // Subscribe to participant updates
      const participantChannel = supabase
        .channel(`stage-participants-${stageId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stage_participants',
            filter: `stage_id=eq.${stageId}`
          },
          (payload) => this.handleParticipantUpdate(payload)
        )
        .subscribe();

      // Subscribe to chat messages
      const chatChannel = supabase
        .channel(`stage-chat-${stageId}`)
        .on('broadcast', { event: 'chat-message' }, (payload) => {
          this.handleChatMessage(payload.payload);
        })
        .subscribe();

      // Join as participant
      const { error } = await supabase
        .from('stage_participants')
        .upsert({
          stage_id: stageId,
          user_id: userId,
          role: userRole,
          joined_at: new Date().toISOString(),
          is_muted: false,
          is_video_enabled: true,
          is_hand_raised: false
        });

      if (error) throw error;

      console.log('Successfully joined stage:', stageId);
      return true;
    } catch (error) {
      console.error('Failed to join stage:', error);
      return false;
    }
  }

  async leaveStage(userId: string): Promise<void> {
    if (!this.stageId) return;

    try {
      await supabase
        .from('stage_participants')
        .update({ left_at: new Date().toISOString() })
        .eq('stage_id', this.stageId)
        .eq('user_id', userId);

      this.participants.clear();
      this.chatMessages = [];
      this.stageId = null;
    } catch (error) {
      console.error('Failed to leave stage:', error);
    }
  }

  async sendChatMessage(userId: string, userName: string, message: string): Promise<void> {
    if (!this.stageId) return;

    const chatMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      userName,
      message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    const channel = supabase.channel(`stage-chat-${this.stageId}`);
    await channel.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: chatMessage
    });
  }

  async toggleMute(userId: string, muted: boolean): Promise<void> {
    if (!this.stageId) return;

    await supabase
      .from('stage_participants')
      .update({ is_muted: muted })
      .eq('stage_id', this.stageId)
      .eq('user_id', userId);
  }

  async toggleVideo(userId: string, videoEnabled: boolean): Promise<void> {
    if (!this.stageId) return;

    await supabase
      .from('stage_participants')
      .update({ is_video_enabled: videoEnabled })
      .eq('stage_id', this.stageId)
      .eq('user_id', userId);
  }

  async raiseHand(userId: string, handRaised: boolean): Promise<void> {
    if (!this.stageId) return;

    await supabase
      .from('stage_participants')
      .update({ is_hand_raised: handRaised })
      .eq('stage_id', this.stageId)
      .eq('user_id', userId);
  }

  private handleParticipantUpdate(payload: any): void {
    this.emit('participantUpdate', payload);
  }

  private handleChatMessage(message: ChatMessage): void {
    this.chatMessages.push(message);
    this.emit('chatMessage', message);
  }

  on(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);
  }

  off(event: string, handler: Function): void {
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
      this.eventHandlers.set(event, handlers);
    }
  }

  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }

  getParticipants(): StageParticipant[] {
    return Array.from(this.participants.values());
  }

  getChatMessages(): ChatMessage[] {
    return [...this.chatMessages];
  }
}

export default RealTimeStageService.getInstance();
