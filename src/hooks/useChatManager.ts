import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
  };
  is_deleted?: boolean;
  reply_to?: string | null;
  reactions?: { [key: string]: number };
}

interface UseChatManagerProps {
  channelName: string;
}

export const useChatManager = ({ channelName }: UseChatManagerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetries = 5;

  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  // Function to generate a UUID for a new message
  const generateMessageId = () => uuidv4();

  // Function to handle WebSocket connection
  const connectWebSocket = useCallback(async () => {
    if (!user?.id) {
      console.warn('User not authenticated, skipping WebSocket connection');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReconnecting(false);

    try {
      // Fetch or create channel ID
      const response = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (response.error) {
        throw new Error(`Failed to fetch channel: ${response.error.message}`);
      }

      let fetchedChannelId = response.data?.id;

      if (!fetchedChannelId) {
        const insertResponse = await supabase
          .from('channels')
          .insert([{ name: channelName, type: 'public' }])
          .select('id')
          .single();

        if (insertResponse.error) {
          throw new Error(`Failed to create channel: ${insertResponse.error.message}`);
        }

        fetchedChannelId = insertResponse.data.id;
      }

      setChannelId(fetchedChannelId);

      // Initialize WebSocket connection
      const socketUrl = `${process.env.NEXT_PUBLIC_REALTIME_URL}/?channel=${channelName}&user_id=${user.id}&channel_id=${fetchedChannelId}`;
      ws.current = new WebSocket(socketUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsLoading(false);
        setConnectionAttempts(0);
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'initial_messages') {
            const initialMessages = JSON.parse(msg.messages);
            setMessages(initialMessages);
          } else if (msg.type === 'new_message') {
            const newMessage = JSON.parse(msg.message);
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          } else if (msg.type === 'message_deleted') {
            const deletedMessageId = JSON.parse(msg.message).id;
            setMessages((prevMessages) =>
              prevMessages.map((m) =>
                m.id === deletedMessageId ? { ...m, is_deleted: true } : m
              )
            );
          }
        } catch (error) {
          console.error('Failed to parse message', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsLoading(false);

        if (connectionAttempts < maxRetries) {
          setReconnecting(true);
          retryTimeout.current = setTimeout(() => {
            setConnectionAttempts((prevAttempts) => prevAttempts + 1);
            connectWebSocket();
          }, 2000 ** (connectionAttempts + 1));
        } else {
          setError('Max reconnection attempts reached. Please refresh the page.');
          setReconnecting(false);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setIsLoading(false);
        setError('Failed to connect to chat. Please try again.');
      };
    } catch (err: any) {
      console.error('WebSocket connection error:', err);
      setIsConnected(false);
      setIsLoading(false);
      setError(err.message || 'Failed to connect to chat.');
    } finally {
      setIsLoading(false);
    }
  }, [channelName, user?.id, connectionAttempts]);

  // Function to send a message
  const sendMessage = useCallback(
    async (content: string) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !user?.id || !channelId) {
        toast.error('Not connected to chat. Please try again.');
        return false;
      }

      setIsSending(true);
      try {
        const messageId = generateMessageId();
        const messagePayload = {
          id: messageId,
          content: content.trim(),
          created_at: new Date().toISOString(),
          sender_id: user.id,
          channel_id: channelId,
          reply_to: replyTo,
          type: 'new_message',
        };

        ws.current.send(JSON.stringify(messagePayload));
        setMessageText('');
        setReplyTo(null);
        return true;
      } catch (error) {
        console.error('Failed to send message', error);
        toast.error('Failed to send message. Please try again.');
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [user?.id, channelId, replyTo]
  );

  // Function to delete a message
  const deleteMessage = useCallback(
    async (messageId: string) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !user?.id) {
        toast.error('Not connected to chat. Please try again.');
        return;
      }

      try {
        const deletePayload = {
          id: messageId,
          sender_id: user.id,
          type: 'delete_message',
        };
        ws.current.send(JSON.stringify(deletePayload));
      } catch (error) {
        console.error('Failed to delete message', error);
        toast.error('Failed to delete message. Please try again.');
      }
    },
    [user?.id]
  );

  // Function to reply to a message
  const replyToMessage = useCallback((messageId: string) => {
    setReplyTo(messageId);
  }, []);

  // Function to add a reaction to a message
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !user?.id) {
      toast.error('Not connected to chat. Please try again.');
      return;
    }

    try {
      const reactionPayload = {
        message_id: messageId,
        user_id: user.id,
        reaction: reaction,
        type: 'add_reaction',
      };
      ws.current.send(JSON.stringify(reactionPayload));
    } catch (error) {
      console.error('Failed to add reaction', error);
      toast.error('Failed to add reaction. Please try again.');
    }
  }, [user?.id]);

  // Disconnect WebSocket on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up WebSocket');
      if (ws.current) {
        ws.current.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, []);

  // Connect WebSocket on mount and when channelName changes
  useIsomorphicLayoutEffect(() => {
    if (channelName && user?.id) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (retryTimeout.current) {
        clearTimeout(retryTimeout.current);
      }
    };
  }, [channelName, user?.id, connectWebSocket]);

  const reconnect = () => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
    }
    setConnectionAttempts(0);
    connectWebSocket();
  };

  return {
    messages,
    isLoading,
    isConnected,
    isSending,
    error,
    messageText,
    channelId,
    reconnecting,
    connectionAttempts,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction,
    setMessageText,
    setReplyTo,
    reconnect
  };
};
