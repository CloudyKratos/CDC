
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

interface UseRealtimeSubscription {
  isConnected: boolean;
  setupRealtimeSubscription: (channelId: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => any;
}

export function useRealtimeSubscription(): UseRealtimeSubscription {
  const [isConnected, setIsConnected] = useState(false);

  const setupRealtimeSubscription = useCallback((channelId: string, setMessages: React.Dispatch<React.SetStateAction<Message[]>>) => {
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

          setMessages(prev => {
            // Check if message already exists
            const exists = prev.some(m => m.id === message.id);
            if (exists) return prev;
            
            return [...prev, message].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
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
            setMessages(prev => prev.filter(m => m.id !== updatedMessage.id));
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
        }
      });

    return subscription;
  }, []);

  return {
    isConnected,
    setupRealtimeSubscription
  };
}
