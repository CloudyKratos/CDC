import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export function useSimpleChatSystem(channelName: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
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
        .eq('channel_id', channelName)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to load messages: ${error.message}`);
      }

      const formattedMessages = (data || []).map(msg => ({
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
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setIsLoading(false);
    }
  }, [channelName]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelName,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  }, [user?.id, channelName]);

  useEffect(() => {
    loadMessages();

    const channel = supabase
      .channel(`community_messages_${channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelName}`
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

          setMessages(prev => [...prev, message]);
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, loadMessages]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage
  };
}
