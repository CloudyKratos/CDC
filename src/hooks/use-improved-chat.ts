import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { useChatConnection } from './use-chat-connection';
import { toast } from 'sonner';

export function useImprovedChat(channelName: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const connection = useChatConnection();
  const messagesRef = useRef<Message[]>([]);

  // Keep messages ref in sync
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Get or create channel
  const initializeChannel = useCallback(async () => {
    if (!user?.id || !channelName) return;

    console.log('🚀 Initializing channel:', channelName);
    setIsLoading(true);

    try {
      // Check if channel exists
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Create channel if it doesn't exist
      if (!channel) {
        console.log('📝 Creating channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName} discussion`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        channel = newChannel;
      }

      setChannelId(channel.id);
      
      // Load existing messages
      await loadMessages(channel.id);
      
      // Setup real-time subscription
      connection.setupSubscription(channel.id, handleNewMessage);
      
    } catch (error) {
      console.error('❌ Failed to initialize channel:', error);
      toast.error('Failed to connect to chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName]);

  // Load messages from database
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messagesData, error } = await supabase
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

      if (error) throw error;

      const formattedMessages = (messagesData || []).map(msg => ({
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

      setMessages(formattedMessages);
      console.log('✅ Loaded', formattedMessages.length, 'messages');
      
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setMessages([]);
    }
  }, []);

  // Handle new real-time messages
  const handleNewMessage = useCallback((newMessage: Message) => {
    setMessages(prev => {
      // Prevent duplicates
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      
      return [...prev, newMessage];
    });
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !user?.id || !content.trim() || isSending) {
      return false;
    }

    setIsSending(true);

    try {
      console.log('📤 Sending message:', content.substring(0, 50));
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;

      console.log('✅ Message sent successfully');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [channelId, user?.id, isSending]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
      
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Initialize on mount
  useEffect(() => {
    if (user?.id && channelName) {
      initializeChannel();
    }

    return () => {
      connection.disconnect();
    };
  }, [user?.id, channelName]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (channelId) {
      connection.manualReconnect(channelId, handleNewMessage);
    }
  }, [channelId, connection, handleNewMessage]);

  return {
    messages,
    isLoading,
    isSending,
    isConnected: connection.isConnected,
    isReconnecting: connection.isReconnecting,
    error: connection.error,
    sendMessage,
    deleteMessage,
    reconnect
  };
}
