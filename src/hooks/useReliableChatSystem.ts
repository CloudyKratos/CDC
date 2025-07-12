import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
}

export function useReliableChatSystem(channelName: string) {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    isConnected: false,
    error: null,
  });

  const { user } = useAuth();
  const [channelId, setChannelId] = useState<string | null>(null);
  const subscription = useRef<any>(null);
  const retryTimeout = useRef<any>(null);
  const retryCount = useRef(0);

  const updateChatState = (newState: Partial<ChatState>) => {
    setChatState((prevState) => ({ ...prevState, ...newState }));
  };

  const connect = useCallback(async () => {
    if (!user?.id || !channelName) return;

    updateChatState({ isLoading: true, error: null });

    try {
      // Get or create channel
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!channel) {
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} discussion`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        channel = newChannel;
      }

      setChannelId(channel.id);

      // Load existing messages
      const { data: messages, error: messagesError } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles!community_messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.warn('Could not load messages:', messagesError);
        updateChatState({ messages: [] });
      } else {
        const formattedMessages = (messages || []).map(msg => ({
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
            id: msg.sender_id,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          }
        }));
        updateChatState({ messages: formattedMessages });
      }

      // Set up real-time subscription
      setupRealtimeSubscription(channel.id);
      updateChatState({ isConnected: true, isLoading: false });
      retryCount.current = 0; // Reset retry count on successful connection
    } catch (err) {
      console.error('Failed to connect to chat:', err);
      updateChatState({
        error: err instanceof Error ? err.message : 'Failed to connect to chat',
        isLoading: false,
        isConnected: false,
      });

      // Retry connection with exponential backoff
      if (retryCount.current < 5) {
        const delay = Math.pow(2, retryCount.current) * 1000; // Exponential backoff
        retryCount.current++;

        retryTimeout.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        toast.error('Failed to connect after multiple retries.');
      }
    }
  }, [user?.id, channelName]);

  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscription.current) {
      supabase.removeChannel(subscription.current);
    }

    const newSubscription = supabase
      .channel(`reliable_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
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

          setChatState(prev => {
            const exists = prev.messages.some(msg => msg.id === message.id);
            if (exists) return prev;
            return { ...prev, messages: [...prev.messages, message] };
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
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setChatState(prev => ({
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== updatedMessage.id)
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          updateChatState({ isConnected: true });
          retryCount.current = 0; // Reset retry count on successful subscription
        } else {
          updateChatState({ isConnected: false });
        }

        // Reconnect on disconnect
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (retryCount.current < 5) {
            const delay = Math.pow(2, retryCount.current) * 1000;
            retryCount.current++;

            retryTimeout.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            toast.error('Connection lost. Please refresh the page.');
          }
        }
      });

    subscription.current = newSubscription;
  }, [connect]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user?.id || !channelId || !content.trim()) {
        toast.error('Cannot send message');
        return;
      }

      try {
        const { error } = await supabase
          .from('community_messages')
          .insert({
            channel_id: channelId,
            sender_id: user.id,
            content: content.trim(),
          });

        if (error) {
          throw new Error(`Failed to send message: ${error.message}`);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        toast.error('Failed to send message');
      }
    },
    [user?.id, channelId]
  );

  useEffect(() => {
    connect();

    return () => {
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [connect]);

  return {
    ...chatState,
    sendMessage,
  };
}
