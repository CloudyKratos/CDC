
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { useConnectionManager } from './use-connection-manager';

export function useEnhancedRealtime() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const connectionManager = useConnectionManager();
  const activeChannelRef = useRef<string | null>(null);

  // Setup realtime subscription for a channel
  const subscribeToChannel = useCallback((channelId: string) => {
    if (!channelId || !user?.id) return;

    console.log('📡 Setting up enhanced realtime for:', channelId);
    activeChannelRef.current = channelId;

    // Message insertions
    connectionManager.createSubscription(
      `messages_${channelId}`,
      `enhanced_messages_${channelId}`,
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `channel_id=eq.${channelId}`
      },
      async (payload) => {
        console.log('📨 New message received:', payload);
        const newMessage = payload.new as any;
        
        // Get sender profile with error handling
        let sender;
        try {
          const { data: senderData, error } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          sender = senderData || {
            id: newMessage.sender_id,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        } catch (err) {
          console.warn('⚠️ Could not fetch sender profile:', err);
          sender = {
            id: newMessage.sender_id,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          };
        }

        const message: Message = {
          id: newMessage.id,
          content: newMessage.content,
          created_at: newMessage.created_at,
          sender_id: newMessage.sender_id,
          sender
        };

        setMessages(prev => {
          // Prevent duplicates
          const exists = prev.some(msg => msg.id === message.id);
          if (exists) return prev;
          
          // Insert in chronological order
          const newMessages = [...prev, message];
          return newMessages.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
      }
    );

    // Message updates (for deletions)
    connectionManager.createSubscription(
      `messages_updates_${channelId}`,
      `enhanced_messages_updates_${channelId}`,
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
          setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
        }
      }
    );
  }, [user?.id, connectionManager]);

  // Load message history with pagination
  const loadMessages = useCallback(async (channelId: string, limit: number = 50) => {
    if (!channelId || !user?.id) return [];

    setIsLoading(true);
    try {
      console.log('📥 Loading message history for:', channelId);
      
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
        .limit(limit);

      if (error) {
        console.error('❌ Failed to load messages:', error);
        throw error;
      }

      const formattedMessages = messagesData?.map((msg: any) => ({
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
      })) || [];

      console.log('✅ Loaded', formattedMessages.length, 'messages');
      setMessages(formattedMessages);
      return formattedMessages;
      
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      setMessages([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Send message with optimistic updates
  const sendMessage = useCallback(async (channelId: string, content: string) => {
    if (!channelId || !user?.id || !content.trim()) return false;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: user.email?.split('@')[0] || 'You',
        avatar_url: null
      }
    };

    // Add optimistic message
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('📤 Sending message to:', channelId);
      
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
          is_deleted: false
        })
        .select('id, created_at')
        .single();

      if (error) {
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        throw error;
      }

      // Update optimistic message with real data
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, id: data.id, created_at: data.created_at }
          : msg
      ));

      console.log('✅ Message sent successfully');
      return true;

    } catch (error) {
      console.error('💥 Failed to send message:', error);
      // Remove optimistic message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      return false;
    }
  }, [user]);

  // Clear messages when switching channels
  const clearMessages = useCallback(() => {
    setMessages([]);
    activeChannelRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    isConnected: connectionManager.isConnected,
    connectionError: connectionManager.lastError,
    subscribeToChannel,
    loadMessages,
    sendMessage,
    clearMessages,
    reconnect: connectionManager.reconnect
  };
}
