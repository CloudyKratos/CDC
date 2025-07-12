import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';
import useIsomorphicLayoutEffect from './useIsomorphicLayoutEffect';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types/chat';

export interface UseChatManagerProps {
  channelName: string;
  enableTyping?: boolean;
  enableReactions?: boolean;
}

const TYPING_TIMEOUT = 3000;

export const useChatManager = ({ channelName, enableTyping = true, enableReactions = true }: UseChatManagerProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();
  const [lastTypingTime, setLastTypingTime] = useState<number>(0);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});

  // Store the channel name in a ref so it's up-to-date within the subscription callback
  const channelNameRef = useRef(channelName);
  useEffect(() => {
    channelNameRef.current = channelName;
  }, [channelName]);

  // Optimistic update for reactions
  const addReactionOptimistic = useCallback((messageId: string, reaction: string) => {
    setMessageReactions(prevReactions => {
      const existingReactions = prevReactions[messageId] || [];
      return {
        ...prevReactions,
        [messageId]: [...existingReactions, reaction]
      };
    });
  }, []);

  // Optimistic update for deleting messages
  const deleteMessageOptimistic = useCallback((messageId: string) => {
    setMessages(currentMessages => currentMessages.filter(msg => msg.id !== messageId));
  }, []);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to send messages.');
      return false;
    }

    setIsSending(true);
    setError(null);

    const newMessageId = uuidv4();

    // Optimistic update
    const newMessage: Message = {
      id: newMessageId,
      channel_id: channelNameRef.current,
      sender_id: user.id,
      content: content,
      created_at: new Date().toISOString(),
      sender: {
        id: user.id,
        username: user.name || user.email,
        full_name: user.name || user.email,
        avatar_url: user.avatar || null,
      },
    };

    setMessages(prevMessages => [...prevMessages, newMessage]);

    try {
      const { error } = await supabase
        .from('messages')
        .insert([
          {
            id: newMessageId,
            channel_id: channelNameRef.current,
            sender_id: user.id,
            content: content,
          },
        ]);

      if (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message.');
        // Revert optimistic update
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== newMessageId));
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message.');
      // Revert optimistic update
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== newMessageId));
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user]);

  const deleteMessage = useCallback(async (messageId: string) => {
    setError(null);
    deleteMessageOptimistic(messageId);

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .match({ id: messageId });

      if (error) {
        console.error('Error deleting message:', error);
        setError('Failed to delete message.');
        // Revert optimistic update if needed
        // setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message.');
    }
  }, [deleteMessageOptimistic]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    setError(null);
    addReactionOptimistic(messageId, reaction);

    try {
      // TODO: Implement reaction saving to database
      // const { error } = await supabase
      //   .from('message_reactions')
      //   .insert({ message_id: messageId, reaction: reaction });

      // if (error) {
      //   console.error('Error adding reaction:', error);
      //   setError('Failed to add reaction.');
      //   // Revert optimistic update if needed
      //   // setMessages(prevMessages => [...prevMessages, newMessage]);
      // }
    } catch (err) {
      console.error('Error adding reaction:', err);
      setError('Failed to add reaction.');
    }
  }, [addReactionOptimistic]);

  const startTyping = useCallback(() => {
    if (!enableTyping || !user) return;

    const now = Date.now();
    setLastTypingTime(now);

    if (!isConnected) return;

    supabase
      .from('typing_status')
      .upsert({ channel_id: channelNameRef.current, user_id: user.id, last_typed: new Date() })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to send typing status', error);
        }
      });
  }, [enableTyping, user, isConnected]);

  const clearTypingStatus = useCallback(() => {
    if (!user) return;

    supabase
      .from('typing_status')
      .delete()
      .match({ channel_id: channelNameRef.current, user_id: user.id })
      .then(({ error }) => {
        if (error) {
          console.error('Failed to clear typing status', error);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!enableTyping) return;

    const handleTypingTimeout = () => {
      if (Date.now() - lastTypingTime >= TYPING_TIMEOUT) {
        clearTypingStatus();
      }
    };

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(handleTypingTimeout, TYPING_TIMEOUT + 100);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      clearTypingStatus();
    };
  }, [lastTypingTime, clearTypingStatus, enableTyping]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const channel = supabase.channel(channelNameRef.current);

    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelNameRef.current}` }, (payload) => {
        if (payload.errors) {
          console.error('Error in postgres_changes:', payload.errors);
          return;
        }

        const message = payload.new as Message;

        switch (payload.eventType) {
          case 'INSERT':
            setMessages((prevMessages) => {
              if (prevMessages.find((m) => m.id === message.id)) {
                return prevMessages;
              }
              return [...prevMessages, message];
            });
            break;
          case 'UPDATE':
            setMessages((prevMessages) =>
              prevMessages.map((m) => (m.id === message.id ? message : m))
            );
            break;
          case 'DELETE':
            setMessages((prevMessages) =>
              prevMessages.filter((m) => m.id !== message.id)
            );
            break;
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        // console.log('profile changes', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status', filter: `channel_id=eq.${channelNameRef.current}` }, (payload) => {
        if (!enableTyping) return;

        if (payload.errors) {
          console.error('Error in typing_status changes:', payload.errors);
          return;
        }

        const typing = payload.new;

        switch (payload.eventType) {
          case 'INSERT':
          case 'UPDATE':
            setTypingUsers((prevTypingUsers) => {
              if (prevTypingUsers.includes(typing.user_id)) {
                return prevTypingUsers;
              }
              return [...prevTypingUsers, typing.user_id];
            });
            break;
          case 'DELETE':
            setTypingUsers((prevTypingUsers) =>
              prevTypingUsers.filter((userId) => userId !== typing.user_id)
            );
            break;
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);

          // Load initial messages
          try {
            const { data, error } = await supabase
              .from('messages')
              .select(`*, sender:profiles(*)`)
              .eq('channel_id', channelNameRef.current)
              .order('created_at', { ascending: true });

            if (error) {
              console.error('Error fetching messages:', error);
              setError('Failed to load messages.');
            } else {
              setMessages(data || []);
            }
          } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Failed to load messages.');
          } finally {
            setIsLoading(false);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Connection lost. Reconnecting...');
          setIsLoading(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, enableTyping]);

  const reconnect = () => {
    setIsConnected(false);
    setIsLoading(true);
    setError('Reconnecting...');
  };

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    deleteMessage,
    isSending,
    error,
    typingUsers,
    addReaction,
    reconnect
  };
};
