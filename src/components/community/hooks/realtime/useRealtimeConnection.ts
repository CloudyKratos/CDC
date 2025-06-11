
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

interface UseRealtimeConnection {
  isConnected: boolean;
  setupSubscription: (channelId: string, onMessage: (message: Message) => void, onMessageUpdate: (messageId: string) => void) => () => void;
}

export function useRealtimeConnection(): UseRealtimeConnection {
  const [isConnected, setIsConnected] = useState(false);

  const setupSubscription = useCallback((
    channelId: string, 
    onMessage: (message: Message) => void,
    onMessageUpdate: (messageId: string) => void
  ) => {
    console.log('🔄 Setting up realtime subscription for channel:', channelId);
    
    const subscription = supabase
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

          const message: Message = {
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

          onMessage(message);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload);
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            onMessageUpdate(updatedMessage.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connection established');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime connection error');
          setIsConnected(false);
        }
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, []);

  return {
    isConnected,
    setupSubscription
  };
}
