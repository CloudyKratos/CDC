
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import type { CommunityMessage } from './types';

class SubscriptionService {
  // Subscribe to new messages in a channel
  subscribeToMessages(channelName: string, callback: (message: Message) => void): () => void {
    console.log('🔄 SubscriptionService: Setting up subscription for channel:', channelName);
    
    let subscription: any = null;
    
    const setupSubscription = async () => {
      try {
        const { data: channel, error } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName)
          .single();

        if (error || !channel) {
          console.error('❌ SubscriptionService: Error finding channel for subscription:', error);
          return;
        }
        
        console.log('✅ SubscriptionService: Channel found for subscription:', channel);
        
        subscription = supabase
          .channel(`community_messages_${channel.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'community_messages',
              filter: `channel_id=eq.${channel.id}`
            },
            async (payload) => {
              console.log('📨 SubscriptionService: New message received:', payload);
              const newMessage = payload.new as CommunityMessage;
              
              // Fetch sender details
              const { data: sender } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();

              callback({
                id: newMessage.id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.sender_id,
                sender: sender || {
                  id: newMessage.sender_id,
                  username: 'Unknown User',
                  full_name: 'Unknown User',
                  avatar_url: null
                }
              });
            }
          )
          .subscribe();

        console.log('✅ SubscriptionService: Subscription created:', subscription);
      } catch (error) {
        console.error('💥 SubscriptionService: Exception setting up subscription:', error);
      }
    };

    // Execute the async setup
    setupSubscription();

    return () => {
      console.log('🧹 SubscriptionService: Cleaning up subscription');
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }

  // Get online users in a channel
  async getChannelOnlineUsers(channelName: string): Promise<any[]> {
    // This would need to be implemented with presence tracking
    // For now, return empty array
    return [];
  }
}

export default new SubscriptionService();
