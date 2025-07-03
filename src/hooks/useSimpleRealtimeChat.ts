
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  channelId: string | null;
}

export function useSimpleRealtimeChat(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    channelId: null
  });

  const subscriptionRef = useRef<any>(null);
  const initializingRef = useRef(false);

  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id || initializingRef.current) {
      if (!user?.id) {
        updateState({ 
          error: 'Please sign in to use chat',
          isLoading: false,
          isConnected: false 
        });
      }
      return;
    }

    initializingRef.current = true;
    updateState({ isLoading: true, error: null });

    try {
      console.log('🚀 Initializing chat for channel:', channelName);

      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError) {
        console.error('❌ Channel query error:', channelError);
        throw new Error(`Channel error: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 Creating new channel:', channelName);
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

        if (createError) {
          console.error('❌ Create channel error:', createError);
          throw new Error(`Create channel error: ${createError.message}`);
        }
        channel = newChannel;
      }

      console.log('✅ Channel ready:', channel.id);
      updateState({ channelId: channel.id });

      // Load messages
      await loadMessages(channel.id);

      // Setup realtime subscription
      setupRealtimeSubscription(channel.id);

      updateState({ isLoading: false, isConnected: true });
      console.log('✅ Chat initialized successfully');

    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
      updateState({ 
        error: errorMessage,
        isLoading: false,
        isConnected: false 
      });
      toast.error(`Chat Error: ${errorMessage}`);
    } finally {
      initializingRef.current = false;
    }
  }, [user?.id, channelName, updateState]);

  // Load messages
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messages, error } = await supabase
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
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('❌ Load messages error:', error);
        throw new Error(`Load messages error: ${error.message}`);
      }

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

      updateState({ messages: formattedMessages });
      console.log(`✅ Loaded ${formattedMessages.length} messages`);

    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      updateState({ messages: [] });
      toast.error('Failed to load messages');
    }
  }, [updateState]);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription for channel:', channelId);

    const subscription = supabase
      .channel(`messages_${channelId}`)
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

          setState(prev => {
            const exists = prev.messages.some(msg => msg.id === message.id);
            if (exists) return prev;
            return { 
              ...prev, 
              messages: [...prev.messages, message] 
            };
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        updateState({ 
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : 'Connection lost'
        });
      });

    subscriptionRef.current = subscription;
  }, [updateState]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !state.channelId || !content.trim()) {
      if (!user?.id) toast.error("Please sign in to send messages");
      if (!state.channelId) toast.error("No channel available");
      return false;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50) + '...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: state.channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Send message error:', error);
        throw new Error(`Send message error: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, state.channelId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete message error:', error);
        throw new Error(`Delete message error: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      
      // Remove from local state
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId)
      }));
      
      return true;
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting...');
    updateState({ error: null, isLoading: true });
    initializeChat();
  }, [initializeChat, updateState]);

  // Initialize on mount
  useEffect(() => {
    initializeChat();

    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription');
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [initializeChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    reconnect,
    isReady: state.isConnected && !state.isLoading && !state.error
  };
}
