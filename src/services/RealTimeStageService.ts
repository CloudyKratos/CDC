
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

  getConnectedUsers(): any[] {
    if (!this.currentChannel) return [];
    
    const presenceState = this.currentChannel.presenceState();
    const users: any[] = [];
    
    Object.values(presenceState).forEach((presence: any) => {
      if (Array.isArray(presence)) {
        users.push(...presence);
      } else {
        users.push(presence);
      }
    });
    
    return users;
  }

  updatePresence(updates: Partial<StagePresence>): Promise<'ok' | 'error' | 'timed_out'> {
    if (!this.currentChannel || !this.isConnected) {
      return Promise.resolve('error');
    }

    const currentPresence = this.currentChannel.presenceState();
    const myPresence = Object.values(currentPresence)[0] as StagePresence[];
    
    if (myPresence && myPresence[0]) {
      const updatedPresence = { ...myPresence[0], ...updates };
      return this.currentChannel.track(updatedPresence);
    }
    
    return Promise.resolve('error');
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
