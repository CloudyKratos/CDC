
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ConnectionState {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  retryCount: number;
}

export function useChatConnection() {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isReconnecting: false,
    error: null,
    retryCount: 0
  });

  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 5;

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setupSubscription = useCallback((
    channelId: string, 
    onMessage: (message: Message) => void
  ) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up subscription for channel:', channelId);
    
    const subscription = supabase
      .channel(`chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('📨 New message:', payload);
          const newMessage = payload.new as any;
          
          try {
            // Get sender info
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
          } catch (error) {
            console.error('Error processing message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Connection status:', status);
        
        switch (status) {
          case 'SUBSCRIBED':
            updateState({ 
              isConnected: true, 
              isReconnecting: false, 
              error: null, 
              retryCount: 0 
            });
            break;
          case 'CHANNEL_ERROR':
          case 'CLOSED':
            updateState({ isConnected: false });
            attemptReconnect(channelId, onMessage);
            break;
        }
      });

    subscriptionRef.current = subscription;
  }, [updateState]);

  const attemptReconnect = useCallback((channelId: string, onMessage: (message: Message) => void) => {
    if (state.retryCount >= maxRetries) {
      updateState({ 
        error: 'Connection failed after multiple attempts',
        isReconnecting: false 
      });
      toast.error('Unable to connect to chat');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, state.retryCount), 10000);
    
    updateState({ 
      isReconnecting: true,
      retryCount: state.retryCount + 1
    });

    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${state.retryCount + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setupSubscription(channelId, onMessage);
    }, delay);
  }, [state.retryCount, setupSubscription, updateState]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateState({
      isConnected: false,
      isReconnecting: false,
      error: null,
      retryCount: 0
    });
  }, [updateState]);

  const manualReconnect = useCallback((channelId: string, onMessage: (message: Message) => void) => {
    disconnect();
    updateState({ retryCount: 0 });
    setupSubscription(channelId, onMessage);
  }, [disconnect, setupSubscription, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return disconnect;
  }, [disconnect]);

  return {
    ...state,
    setupSubscription,
    disconnect,
    manualReconnect
  };
}
