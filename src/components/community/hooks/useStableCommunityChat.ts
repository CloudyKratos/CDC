import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useStableCommunityChat(defaultChannel: string = 'general') {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState(null);
  const subscriptionRef = useRef(null);

  const getOrCreateChannel = useCallback(async (channelName) => {
    if (!user?.id) return null;

    try {
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

      return channel.id;
    } catch (err) {
      setError('Failed to access channel');
      return null;
    }
  }, [user?.id]);

  const loadMessages = useCallback(async (channelId) => {
    try {
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

      if (error) throw error;

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

      setMessages(formattedMessages);
    } catch (err) {
      setMessages([]);
      setError('Failed to load messages');
    }
  }, []);

  const setupRealtimeSubscription = useCallback((channelId) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const subscription = supabase
      .channel(`stable_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          const newMessage = payload.new;

          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const message = {
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
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            return [...prev, message];
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
          const updatedMessage = payload.new;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, []);

  const initializeChat = useCallback(async (channelName) => {
    if (!user?.id) {
      setIsLoading(false);
      setError('Please log in to access chat');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const channelId = await getOrCreateChannel(channelName);
      if (!channelId) {
        setIsLoading(false);
        return;
      }

      setChannelId(channelId);
      await loadMessages(channelId);
      setupRealtimeSubscription(channelId);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to connect to chat');
      setIsLoading(false);
    }
  }, [user?.id, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  const sendMessage = useCallback(async (content) => {
    if (!user?.id || !channelId || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      setError('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

  const deleteMessage = useCallback(async (messageId) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    } catch (err) {
      setError('Failed to delete message');
    }
  }, [user?.id]);

  useEffect(() => {
    initializeChat(defaultChannel);

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [defaultChannel, initializeChat]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage,
    channelId,
    reconnect: () => initializeChat(defaultChannel)
  };
}
