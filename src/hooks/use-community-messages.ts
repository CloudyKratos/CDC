import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export const useCommunityMessages = (channelName: string = 'general') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Load initial messages and set up subscription
  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;
    let reconnectAttempt = 0;
    const maxRetries = 5;

    const loadInitialMessages = async (channel_id: string) => {
      if (!user?.id) {
        console.log('Not authenticated, skipping initial message load');
        return;
      }

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
          .eq('channel_id', channel_id)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        if (error && mounted) {
          console.error('Error fetching messages:', error);
          setError(`Failed to load initial messages: ${error.message}`);
          return;
        }

        if (mounted && data) {
          const formattedMessages = data.map(msg => ({
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
        }
      } catch (err: any) {
        if (mounted) {
          console.error('Error during initial message load:', err);
          setError(`Error loading messages: ${err.message}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const setupSubscription = (channel_id: string) => {
      if (!user?.id) {
        console.log('Not authenticated, skipping subscription setup');
        return;
      }

      setIsReconnecting(false);
      setIsConnected(true);
      reconnectAttempt = 0; // Reset reconnect attempts on successful connection
      
      const channel = supabase
        .channel(`community_messages:${channel_id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channel_id}` },
          (payload) => {
            if (mounted && payload.new) {
              const newMessage = {
                id: payload.new.id,
                content: payload.new.content,
                created_at: payload.new.created_at,
                sender_id: payload.new.sender_id,
                sender: {
                  id: payload.new.sender_id,
                  username: 'Unknown User',
                  full_name: 'Unknown User',
                  avatar_url: null
                }
              };
              setMessages(prevMessages => [...prevMessages, newMessage]);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channel_id}` },
          (payload) => {
            if (mounted && payload.new) {
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id === payload.new.id ? { ...msg, content: payload.new.content } : msg
                )
              );
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'community_messages', filter: `channel_id=eq.${channel_id}` },
          (payload) => {
            if (mounted && payload.new) {
              // Handle soft delete
              if (payload.new.is_deleted === true) {
                setMessages(prevMessages =>
                  prevMessages.filter(msg => msg.id !== payload.new.id)
                );
              }
            }
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Realtime subscription started');
            setIsConnected(true);
            setIsReconnecting(false);
            reconnectAttempt = 0;
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.log('Realtime subscription closed:', status);
            setIsConnected(false);
            
            if (reconnectAttempt < maxRetries && mounted) {
              setIsReconnecting(true);
              reconnectAttempt++;
              console.log(`Attempting to reconnect: ${reconnectAttempt}/${maxRetries}`);
              
              retryTimeout = setTimeout(() => {
                console.log('Attempting a new subscription setup after timeout');
                setupSubscription(channel_id);
              }, reconnectAttempt * 2000); // Exponential backoff
            } else if (mounted) {
              console.warn('Max reconnection attempts reached');
              setIsReconnecting(false);
              setError('Connection lost. Max reconnection attempts reached.');
            }
          }
        });

      return channel;
    };

    const getOrCreateChannel = async () => {
      if (!user?.id) return null;

      try {
        // First try to get existing channel
        let { data: channel, error: channelError } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName)
          .eq('type', 'public')
          .maybeSingle();

        if (channelError) {
          console.error('Error checking for channel:', channelError);
          throw channelError;
        }

        if (!channel) {
          // Channel doesn't exist, create it
          const { data: newChannel, error: createError } = await supabase
            .from('channels')
            .insert({
              name: channelName,
              type: 'public',
              description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
              created_by: user.id
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating channel:', createError);
            throw createError;
          }
          
          channel = newChannel;
        }

        return channel.id;
      } catch (err) {
        console.error('Error in getOrCreateChannel:', err);
        setError('Failed to initialize channel');
        return null;
      }
    };

    const initialize = async () => {
      if (!user?.id) {
        console.log('User not authenticated, skipping chat initialization');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Get or create the channel
        const channel_id = await getOrCreateChannel();
        if (!mounted) return;

        if (!channel_id) {
          console.error('Failed to get or create channel');
          setError('Failed to initialize channel');
          setIsLoading(false);
          return;
        }

        setChannelId(channel_id);

        // 2. Load initial messages
        await loadInitialMessages(channel_id);
        if (!mounted) return;

        // 3. Setup realtime subscription
        const channel = setupSubscription(channel_id);
        if (!mounted) return;

        // 4. Store the channel to unsubscribe on unmount
        return () => {
          console.log('Unsubscribing from channel');
          channel.unsubscribe();
          clearTimeout(retryTimeout);
        };
      } catch (initError: any) {
        console.error('Error initializing chat:', initError);
        if (mounted) {
          setError(`Failed to initialize chat: ${initError.message}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [channelName, user?.id]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId) return false;

    try {
      const { error } = await supabase.from('community_messages').insert([
        {
          channel_id: channelId,
          sender_id: user.id,
          content: content
        }
      ]);

      if (error) {
        console.error('Error sending message:', error);
        setError('Failed to send message');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      return false;
    }
  }, [channelId, user?.id]);

  return {
    messages,
    isLoading,
    isConnected,
    isReconnecting,
    error,
    sendMessage,
    channelId
  };
};
