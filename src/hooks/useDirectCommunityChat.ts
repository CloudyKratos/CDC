import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface DirectChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  isReady: boolean;
}

export function useDirectCommunityChat(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<DirectChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    isReady: false
  });

  const subscriptionRef = useRef<any>(null);
  const channelIdRef = useRef<string | null>(null);

  // Direct database operations without complex policies
  const initializeDirectChat = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('🚀 Direct chat initialization starting...');

      // Step 1: Ensure we have a general channel - use direct SQL
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .limit(1)
        .maybeSingle();

      let finalChannelId: string;

      if (existingChannel) {
        finalChannelId = existingChannel.id;
        console.log('✅ Using existing channel:', finalChannelId);
      } else {
        // Create channel with minimal data
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert([{
            name: channelName,
            type: 'public',
            description: `${channelName} discussion`,
            created_by: user.id
          }])
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }

        finalChannelId = newChannel.id;
        console.log('✅ Created new channel:', finalChannelId);
      }

      channelIdRef.current = finalChannelId;

      // Step 2: Load existing messages
      await loadMessagesDirectly(finalChannelId);

      // Step 3: Setup realtime
      setupDirectRealtimeSubscription(finalChannelId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isConnected: true,
        isReady: true
      }));

      console.log('✅ Direct chat initialization complete');

    } catch (error) {
      console.error('💥 Direct chat initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isConnected: false,
        isReady: false
      }));
    }
  }, [user?.id, channelName]);

  // Load messages with direct query
  const loadMessagesDirectly = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages directly...');
      
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
        setState(prev => ({ ...prev, messages: [] }));
        return;
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

      setState(prev => ({ ...prev, messages: formattedMessages }));
      console.log(`✅ Loaded ${formattedMessages.length} messages directly`);

    } catch (error) {
      console.error('💥 Failed to load messages directly:', error);
      setState(prev => ({ ...prev, messages: [] }));
    }
  }, []);

  // Setup realtime subscription
  const setupDirectRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up direct realtime subscription...');

    const subscription = supabase
      .channel(`direct_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('📨 New message received directly:', payload);
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
            setState(prev => ({
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== updatedMessage.id)
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Direct subscription status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : 'Connection lost'
        }));
      });

    subscriptionRef.current = subscription;
  }, []);

  // Send message directly
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelIdRef.current || !content.trim()) {
      console.error('❌ Cannot send message - missing requirements');
      return false;
    }

    try {
      console.log('📤 Sending message directly...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert([{
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        }]);

      if (error) {
        console.error('❌ Direct send error:', error);
        toast.error('Failed to send message');
        return false;
      }

      console.log('✅ Message sent directly');
      return true;
    } catch (error) {
      console.error('💥 Send message failed:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id]);

  // Delete message directly
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete error:', error);
        toast.error('Failed to delete message');
        return false;
      }

      console.log('✅ Message deleted directly');
      return true;
    } catch (error) {
      console.error('💥 Delete failed:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting directly...');
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    initializeDirectChat();
  }, [initializeDirectChat]);

  // Initialize on mount
  useEffect(() => {
    console.log('🔧 Direct community chat mounting...');
    initializeDirectChat();

    return () => {
      console.log('🧹 Direct community chat cleanup');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [initializeDirectChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    reconnect
  };
}
