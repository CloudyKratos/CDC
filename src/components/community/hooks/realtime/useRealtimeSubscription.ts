
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeSubscriptionProps {
  channelId: string | null;
  onMessageReceived: (message: Message) => void;
  onMessageUpdated: (messageId: string) => void;
}

export function useRealtimeSubscription({ 
  channelId, 
  onMessageReceived, 
  onMessageUpdated 
}: UseRealtimeSubscriptionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const subscriptionRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!channelId || !user?.id) {
      setIsConnected(false);
      return;
    }

    console.log('🔄 Setting up realtime subscription for:', channelId);
    
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

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
          
          // Get sender profile
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

          onMessageReceived(message);
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
            onMessageUpdated(updatedMessage.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      setIsConnected(false);
    };
  }, [channelId, user?.id, onMessageReceived, onMessageUpdated]);

  return { isConnected };
}
