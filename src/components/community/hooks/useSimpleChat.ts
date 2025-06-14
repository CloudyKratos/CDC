
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMessageLoader } from './realtime/useMessageLoader';
import { useRealtimeSubscription } from './realtime/useRealtimeSubscription';
import { useOptimizedMessageActions } from './realtime/useOptimizedMessageActions';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

export function useSimpleChat(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();
  const { loadMessages } = useMessageLoader();
  const { sendMessage: sendMessageAction, deleteMessage: deleteMessageAction } = useOptimizedMessageActions();
  const messagesRef = useRef<Message[]>([]);

  // Update ref whenever messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string) => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting/creating channel:', name);
      
      // First try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .single();

      if (channelError && channelError.code === 'PGRST116') {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', name);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: name,
            type: 'public',
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        channel = newChannel;
      } else if (channelError) {
        throw channelError;
      }

      // Ensure user is a member
      await supabase
        .from('channel_members')
        .upsert({
          channel_id: channel.id,
          user_id: user.id
        }, {
          onConflict: 'channel_id,user_id'
        });

      return channel.id;
    } catch (err) {
      console.error('❌ Error getting/creating channel:', err);
      return null;
    }
  }, [user?.id]);

  // Handle new message received
  const handleMessageReceived = useCallback((newMessage: Message) => {
    console.log('📨 New message received:', newMessage);
    setMessages(prev => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      
      return [...prev, newMessage];
    });
  }, []);

  // Handle message updated (e.g., deleted)
  const handleMessageUpdated = useCallback((messageId: string) => {
    console.log('📝 Message updated/deleted:', messageId);
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  // Set up realtime subscription
  const { isConnected: realtimeConnected } = useRealtimeSubscription({
    channelId,
    onMessageReceived: handleMessageReceived,
    onMessageUpdated: handleMessageUpdated
  });

  useEffect(() => {
    setIsConnected(realtimeConnected);
  }, [realtimeConnected]);

  // Initialize channel and load messages
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      if (!user?.id || !channelName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get or create channel
        const id = await getOrCreateChannel(channelName);
        if (!mounted) return;

        if (!id) {
          throw new Error('Failed to get/create channel');
        }

        setChannelId(id);

        // Load existing messages
        const existingMessages = await loadMessages(id);
        if (!mounted) return;

        setMessages(existingMessages);
        console.log('✅ Chat initialized with', existingMessages.length, 'messages');

      } catch (err) {
        console.error('💥 Failed to initialize chat:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
    };
  }, [user?.id, channelName, getOrCreateChannel, loadMessages]);

  // Wrapper functions for message actions
  const sendMessage = useCallback(async (content: string) => {
    try {
      await sendMessageAction(content, channelName);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error handling is done in the action hook
    }
  }, [sendMessageAction, channelName]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessageAction(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      // Error handling is done in the action hook
    }
  }, [deleteMessageAction]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage
  };
}
