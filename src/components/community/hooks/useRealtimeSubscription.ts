
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export function useRealtimeSubscription() {
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionRef = useRef<any>(null);

  const setupRealtimeSubscription = useCallback((channelId: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
    if (!channelId) {
      console.log('⚠️ No channel ID for subscription');
      return;
    }

    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      subscriptionRef.current.unsubscribe();
    }

    console.log('🔄 Setting up realtime subscription for:', channelId);

    subscriptionRef.current = supabase
      .channel(`community_messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;
          
          // Fetch sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage: Message = {
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
          };

          setMessages(prev => [...prev, formattedMessage]);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

  }, []);

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up subscription');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    setupRealtimeSubscription,
    cleanup
  };
}
