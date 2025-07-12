
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
      // First get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelNameRef.current)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw channelError;
      }

      if (!channel) {
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelNameRef.current,
            type: 'public',
            description: `${channelNameRef.current} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) throw createError;
        channel = newChannel;
      }

      const { error } = await supabase
        .from('community_messages')
        .insert([
          {
            id: newMessageId,
            channel_id: channel.id,
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
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) {
        console.error('Error deleting message:', error);
        setError('Failed to delete message.');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      setError('Failed to delete message.');
    }
  }, [deleteMessageOptimistic, user?.id]);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    setError(null);
    addReactionOptimistic(messageId, reaction);

    // Note: Reaction functionality would need database schema changes
    console.log('Reaction added locally:', { messageId, reaction });
  }, [addReactionOptimistic]);

  const startTyping = useCallback(() => {
    if (!enableTyping || !user) return;

    const now = Date.now();
    setLastTypingTime(now);

    if (!isConnected) return;

    // Note: Typing status would need database schema changes
    console.log('User is typing:', user.id);
  }, [enableTyping, user, isConnected]);

  const clearTypingStatus = useCallback(() => {
    if (!user) return;
    console.log('Clearing typing status for:', user.id);
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

    const setupSubscription = async () => {
      try {
        // Get or create channel first
        let { data: channel, error: channelError } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelNameRef.current)
          .eq('type', 'public')
          .maybeSingle();

        if (channelError && channelError.code !== 'PGRST116') {
          throw channelError;
        }

        if (!channel) {
          const { data: newChannel, error: createError } = await supabase
            .from('channels')
            .insert({
              name: channelNameRef.current,
              type: 'public',
              description: `${channelNameRef.current} channel`,
              created_by: user.id
            })
            .select('id')
            .single();

          if (createError) throw createError;
          channel = newChannel;
        }

        // Load existing messages
        const { data: existingMessages, error: messagesError } = await supabase
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
          .eq('channel_id', channel.id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
          setError('Failed to load messages.');
        } else {
          const formattedMessages = (existingMessages || []).map(msg => ({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
            sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
              id: msg.sender_id,
              username: 'Unknown',
              full_name: 'Unknown User',
              avatar_url: null
            }
          }));
          setMessages(formattedMessages);
        }

        // Set up real-time subscription
        const realtimeChannel = supabase.channel(`community_messages_${channel.id}`);

        realtimeChannel
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'community_messages',
            filter: `channel_id=eq.${channel.id}`
          }, async (payload) => {
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
                username: 'Unknown',
                full_name: 'Unknown User',
                avatar_url: null
              }
            };

            setMessages((prevMessages) => {
              if (prevMessages.find((m) => m.id === message.id)) {
                return prevMessages;
              }
              return [...prevMessages, message];
            });
          })
          .on('postgres_changes', { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'community_messages',
            filter: `channel_id=eq.${channel.id}`
          }, (payload) => {
            const updatedMessage = payload.new as any;
            if (updatedMessage.is_deleted) {
              setMessages((prevMessages) =>
                prevMessages.filter((m) => m.id !== updatedMessage.id)
              );
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
              setIsConnected(false);
              setError('Connection lost. Reconnecting...');
            }
            setIsLoading(false);
          });

        return () => {
          supabase.removeChannel(realtimeChannel);
        };
      } catch (err) {
        console.error('Error setting up subscription:', err);
        setError('Failed to connect to chat.');
        setIsLoading(false);
      }
    };

    const cleanup = setupSubscription();
    return () => {
      cleanup.then(fn => fn && fn());
    };
  }, [user, channelName]);

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
    reconnect,
    replyToMessage: async (messageId: string, content: string) => {
      // Placeholder for reply functionality
      return await sendMessage(`@${messageId}: ${content}`);
    }
  };
};
