import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/types/chat';

export const useRobustCommunityChat = (channelName: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetries = 5;

  const { user } = useAuth();

  const clearError = () => setError(null);

  const loadInitialMessages = useCallback(async () => {
    setIsLoading(true);
    clearError();
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:user_profiles(*)')
        .eq('channel_name', channelName)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(`Error fetching messages: ${error.message}`);
      }

      if (data) {
        setMessages(data.reverse() as Message[]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load initial messages.');
      console.error("Error loading initial messages:", err);
    } finally {
      setIsLoading(false);
    }
  }, [channelName]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!user) return;

    setIsLoading(true);
    clearError();

    const channel = supabase.channel(`community_chat_${channelName}`, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.errors) {
          console.error('Error in postgres_changes:', payload.errors);
          return;
        }

        if (payload.new) {
          const newMessage = {
            ...payload.new,
            sender: payload.new.sender_id === user.id ? {
              id: user.id,
              username: user.name || user.email,
              full_name: user.name || user.email,
              avatar_url: user.avatar || null
            } : null
          } as Message;
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        // Handle typing events (not implemented in this example)
      })
      .subscribe(async (status) => {
        console.log(`Channel "${channelName}" subscription status:`, status);
        setIsLoading(false);

        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setIsReady(true);
          setConnectionAttempts(0);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setIsReady(false);
          setError('Connection lost. Attempting to reconnect...');
          if (connectionAttempts < maxRetries) {
            setTimeout(() => {
              setConnectionAttempts(prevAttempts => prevAttempts + 1);
              channel.rejoin();
            }, 2000 * connectionAttempts);
          } else {
            setError('Failed to reconnect after multiple attempts.');
          }
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setIsReady(false);
          setError('Connection timed out. Reconnecting...');
          channel.rejoin();
        }
      });

    return () => {
      console.log(`Unsubscribing from channel: community_chat_${channelName}`);
      channel.unsubscribe();
    };
  }, [channelName, user, connectionAttempts, maxRetries]);

  useEffect(() => {
    if (user) {
      loadInitialMessages();
      const unsubscribe = setupRealtimeSubscription();
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    } else {
      setMessages([]);
      setIsConnected(false);
      setIsReady(false);
    }
  }, [user, loadInitialMessages, setupRealtimeSubscription]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !isConnected) {
      toast.error("Not connected to the chat.");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert([{
          content,
          channel_name: channelName,
          sender_id: user.id,
        }])
        .select()
        .single();

      if (error) {
        console.error("Error sending message:", error);
        toast.error(`Failed to send message: ${error.message}`);
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      return false;
    }
  }, [user, channelName, isConnected]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error("Error deleting message:", error);
        toast.error(`Failed to delete message: ${error.message}`);
      } else {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
      }
    } catch (err: any) {
      console.error("Error deleting message:", err);
      toast.error(`Failed to delete message: ${err.message}`);
    }
  }, []);

  const reconnect = () => {
    setIsReady(false);
    setIsConnected(false);
    setConnectionAttempts(0);
    setupRealtimeSubscription();
  };

  return {
    messages,
    isLoading,
    isConnected,
    error,
    isReady,
    connectionAttempts,
    sendMessage,
    deleteMessage,
    reconnect
  };
};
