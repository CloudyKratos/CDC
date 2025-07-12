import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export function useSimpleRealtimeChat(channelId: string) {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useAuth();

  const setupRealtimeSubscription = useCallback(() => {
    if (!channelId || !user?.id) return;

    const subscription = supabase
      .channel(`simple_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [channelId, user?.id]);

  useEffect(() => {
    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup();
    };
  }, [setupRealtimeSubscription]);

  return {
    messages,
    isConnected
  };
}
