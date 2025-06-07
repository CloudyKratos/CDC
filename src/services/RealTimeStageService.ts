
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface StagePresence {
  userId: string;
  userName: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  joinedAt: string;
}

class RealTimeStageService {
  private static instance: RealTimeStageService;
  private currentChannel: RealtimeChannel | null = null;
  private currentStageId: string | null = null;
  private isConnected = false;

  static getInstance(): RealTimeStageService {
    if (!RealTimeStageService.instance) {
      RealTimeStageService.instance = new RealTimeStageService();
    }
    return RealTimeStageService.instance;
  }

  async joinStage(
    stageId: string, 
    userId: string, 
    role: 'speaker' | 'audience' | 'moderator' = 'audience'
  ): Promise<boolean> {
    try {
      console.log('Joining real-time stage:', { stageId, userId, role });

      // Leave existing channel if any
      if (this.currentChannel) {
        await this.leaveStage(userId);
      }

      // Create new channel
      this.currentChannel = supabase.channel(`stage-realtime-${stageId}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Set up presence tracking
      const presenceData: StagePresence = {
        userId,
        userName: 'User', // This would come from user profile
        role,
        isAudioEnabled: role !== 'audience',
        isVideoEnabled: false,
        joinedAt: new Date().toISOString(),
      };

      // Subscribe to the channel first, then track presence
      const subscriptionPromise = new Promise<boolean>((resolve, reject) => {
        if (!this.currentChannel) {
          reject(new Error('Channel not available'));
          return;
        }

        this.currentChannel.subscribe(async (status) => {
          console.log('Channel subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            try {
              // Now that we're subscribed, we can track our presence
              const trackResult = await this.currentChannel!.track(presenceData);
              console.log('Presence track result:', trackResult);
              
              this.isConnected = true;
              this.currentStageId = stageId;
              resolve(true);
            } catch (error) {
              console.error('Error tracking presence:', error);
              reject(error);
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Subscription failed with status: ${status}`));
          }
        });
      });

      // Set up event listeners
      this.currentChannel
        .on('presence', { event: 'sync' }, () => {
          console.log('Presence sync');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });

      // Wait for subscription to complete
      await subscriptionPromise;
      return true;

    } catch (error) {
      console.error('Failed to join stage:', error);
      this.cleanup();
      return false;
    }
  }

  async leaveStage(userId: string): Promise<void> {
    try {
      console.log('Leaving real-time stage:', userId);

      if (this.currentChannel) {
        // Untrack presence first
        await this.currentChannel.untrack();
        
        // Unsubscribe from channel
        await this.currentChannel.unsubscribe();
        
        // Remove the channel
        supabase.removeChannel(this.currentChannel);
      }

      this.cleanup();
      console.log('Successfully left real-time stage');
    } catch (error) {
      console.error('Error leaving stage:', error);
      // Force cleanup even if there's an error
      this.cleanup();
    }
  }

  getConnectedUsers(): StagePresence[] {
    if (!this.currentChannel) return [];
    
    const presenceState = this.currentChannel.presenceState();
    const users: StagePresence[] = [];
    
    // Supabase presence state structure: { [key]: [presenceData, ...] }
    Object.entries(presenceState).forEach(([key, presences]) => {
      if (Array.isArray(presences)) {
        presences.forEach((presence: any) => {
          // The actual presence data is stored directly in the presence object
          if (this.isValidPresence(presence)) {
            users.push(presence);
          }
        });
      }
    });
    
    return users;
  }

  private isValidPresence(presence: any): presence is StagePresence {
    return presence && 
           typeof presence.userId === 'string' &&
           typeof presence.userName === 'string' &&
           typeof presence.role === 'string' &&
           typeof presence.isAudioEnabled === 'boolean' &&
           typeof presence.isVideoEnabled === 'boolean' &&
           typeof presence.joinedAt === 'string';
  }

  async updatePresence(updates: Partial<StagePresence>): Promise<'ok' | 'error' | 'timed_out'> {
    if (!this.currentChannel || !this.isConnected) {
      return 'error';
    }

    const currentPresence = this.currentChannel.presenceState();
    const myPresenceEntries = Object.values(currentPresence);
    
    if (myPresenceEntries.length > 0 && Array.isArray(myPresenceEntries[0])) {
      const myPresence = myPresenceEntries[0][0];
      if (this.isValidPresence(myPresence)) {
        const updatedPresence = { ...myPresence, ...updates };
        const result = await this.currentChannel.track(updatedPresence);
        
        // Map the response to the expected return type
        if (result === 'ok') return 'ok';
        if (result === 'timed out') return 'timed_out';
        return 'error';
      }
    }
    
    return 'error';
  }

  isConnectedToStage(): boolean {
    return this.isConnected && this.currentChannel !== null;
  }

  getCurrentStageId(): string | null {
    return this.currentStageId;
  }

  private cleanup(): void {
    this.currentChannel = null;
    this.currentStageId = null;
    this.isConnected = false;
  }
}

export default RealTimeStageService.getInstance();
