
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { StageParticipant, ChatMessage } from '@/services/core/types/StageTypes';

interface StageEvent {
  type: 'recording_started' | 'recording_stopped' | 'stage_ended' | 'user_promoted' | 'user_demoted';
  data?: any;
  timestamp: string;
}

class RealTimeStageService {
  private static instance: RealTimeStageService;
  private channel: RealtimeChannel | null = null;
  private stageId: string | null = null;
  private userId: string | null = null;

  static getInstance(): RealTimeStageService {
    if (!RealTimeStageService.instance) {
      RealTimeStageService.instance = new RealTimeStageService();
    }
    return RealTimeStageService.instance;
  }

  async joinStage(stageId: string, userId: string, role: 'speaker' | 'audience' | 'moderator'): Promise<boolean> {
    try {
      this.stageId = stageId;
      this.userId = userId;

      // Create channel for this stage
      this.channel = supabase.channel(`stage-realtime-${stageId}`, {
        config: {
          broadcast: { self: false },
          presence: { key: userId }
        }
      });

      // Track user presence
      await this.channel.track({
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
        is_speaking: false,
        is_hand_raised: false
      });

      await this.channel.subscribe();
      
      // Insert participant record
      const { error } = await supabase
        .from('stage_participants')
        .insert({
          stage_id: stageId,
          user_id: userId,
          role,
          joined_at: new Date().toISOString()
        });

      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Failed to join stage:', error);
      return false;
    }
  }

  async leaveStage(userId: string): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.untrack();
        await this.channel.unsubscribe();
        this.channel = null;
      }

      // Update participant record
      if (this.stageId) {
        await supabase
          .from('stage_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('stage_id', this.stageId)
          .eq('user_id', userId);
      }

      this.stageId = null;
      this.userId = null;
    } catch (error) {
      console.error('Error leaving stage:', error);
    }
  }

  async sendChatMessage(userId: string, userName: string, message: string): Promise<void> {
    if (!this.channel || !this.stageId) return;

    const chatMessage: ChatMessage = {
      id: `${userId}-${Date.now()}`,
      message,
      userId,
      userName,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'chat_message',
      payload: chatMessage
    });

    // Store in community_messages table as a workaround since stage_chat_messages doesn't exist
    try {
      const { data: channels } = await supabase
        .from('channels')
        .select('id')
        .eq('name', `stage-${this.stageId}`)
        .single();

      if (channels) {
        await supabase
          .from('community_messages')
          .insert({
            channel_id: channels.id,
            sender_id: userId,
            content: message,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.warn('Failed to store chat message:', error);
    }
  }

  async toggleMute(userId: string, isMuted: boolean): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'participant_update',
      payload: {
        userId,
        updates: { isAudioEnabled: !isMuted }
      }
    });
  }

  async toggleVideo(userId: string, isVideoEnabled: boolean): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'participant_update',
      payload: {
        userId,
        updates: { isVideoEnabled }
      }
    });
  }

  async raiseHand(userId: string, isRaised: boolean): Promise<void> {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'participant_update',
      payload: {
        userId,
        updates: { isHandRaised: isRaised }
      }
    });
  }

  async startRecording(): Promise<void> {
    if (!this.channel || !this.stageId) return;

    const event: StageEvent = {
      type: 'recording_started',
      timestamp: new Date().toISOString()
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'stage_event',
      payload: event
    });
  }

  async stopRecording(recordingUrl?: string): Promise<void> {
    if (!this.channel) return;

    const event: StageEvent = {
      type: 'recording_stopped',
      data: { url: recordingUrl },
      timestamp: new Date().toISOString()
    };

    await this.channel.send({
      type: 'broadcast',
      event: 'stage_event',
      payload: event
    });
  }

  onParticipantUpdate(callback: (participant: Partial<StageParticipant>) => void): () => void {
    if (!this.channel) return () => {};

    const subscription = this.channel.on('broadcast', { event: 'participant_update' }, ({ payload }) => {
      callback(payload);
    });

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
      }
    };
  }

  onParticipantLeft(callback: (userId: string) => void): () => void {
    if (!this.channel) return () => {};

    const subscription = this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      leftPresences.forEach((presence: any) => {
        callback(presence.user_id);
      });
    });

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
      }
    };
  }

  onChatMessage(callback: (message: ChatMessage) => void): () => void {
    if (!this.channel) return () => {};

    const subscription = this.channel.on('broadcast', { event: 'chat_message' }, ({ payload }) => {
      callback(payload);
    });

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
      }
    };
  }

  onStageEvent(callback: (event: StageEvent) => void): () => void {
    if (!this.channel) return () => {};

    const subscription = this.channel.on('broadcast', { event: 'stage_event' }, ({ payload }) => {
      callback(payload);
    });

    return () => {
      if (this.channel) {
        this.channel.unsubscribe();
      }
    };
  }
}

export default RealTimeStageService.getInstance();
