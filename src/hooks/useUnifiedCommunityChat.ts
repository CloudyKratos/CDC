import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';

interface UseUnifiedCommunityChatProps {
  channelName: string;
}

export const useUnifiedCommunityChat = ({ channelName }: UseUnifiedCommunityChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'unstable'>('healthy');
  const [diagnostics, setDiagnostics] = useState<any>({});

  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 5;

  const { user } = useAuth();
  const lastMessageRef = useRef<Message | null>(null);

  // Load initial messages and subscribe to changes
  useEffect(() => {
    const loadInitialMessages = async () => {
      setIsLoading(true);
      setError(null);
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

        setMessages(data ? data.reverse() : []);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load initial messages.');
        setIsLoading(false);
      }
    };

    if (user) {
      loadInitialMessages();
    }
  }, [channelName, user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) {
      return;
    }

    let messageSubscription: any = null;
    let presenceSubscription: any = null;

    const setupSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      setIsReady(false);

      try {
        // 1. Message Subscription
        messageSubscription = supabase
          .channel('public:messages')
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'messages', filter: `channel_name=eq.${channelName}` },
            async (payload) => {
              if (payload.new) {
                const newMessage = {
                  ...payload.new,
                  sender: user, // Optimistic update
                };

                setMessages((prevMessages) => {
                  const exists = prevMessages.some((msg) => msg.id === newMessage.id);
                  return exists ? prevMessages : [...prevMessages, newMessage];
                });

                // Increment unread count if the message is not from the current user
                if (newMessage.sender_id !== user.id) {
                  setUnreadCount((prevCount) => prevCount + 1);
                }
              }

              if (payload.event === 'DELETE') {
                setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== payload.old.id));
              }
            }
          )
          .subscribe(async (status) => {
            console.log('Message Subscription Status:', status);
            setIsConnected(status === 'SUBSCRIBED');
            setIsReady(status === 'SUBSCRIBED');
            setIsLoading(false);
          });

        // 2. Presence Subscription (typing indicator)
        presenceSubscription = supabase
          .channel('presence-channel', { config: { presence: { key: user.id } } })
          .on('presence', { event: 'sync' }, () => {
            const newState = presenceSubscription.presenceState();
            const onlineUsers = Object.keys(newState);
            setUsers(onlineUsers);
            setTypingUsers((prevTypingUsers) =>
              prevTypingUsers.filter((typingUser) => onlineUsers.includes(typingUser))
            );
          })
          .on('presence', { event: 'join' }, ({ key }) => {
            setUsers((prevUsers) => [...new Set([...prevUsers, key])]);
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            setUsers((prevUsers) => prevUsers.filter((userId) => userId !== key));
            setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((typingUser) => typingUser !== key));
          })
          .subscribe((status) => {
            console.log('Presence Subscription Status:', status);
          });

        // Initialize presence
        await presenceSubscription.track({ online: true });

        setIsConnected(true);
        setIsReady(true);
        setIsLoading(false);
        setConnectionAttempts(0); // Reset attempts on success
      } catch (subscriptionError: any) {
        setError(subscriptionError.message || 'Failed to set up subscriptions.');
        setIsLoading(false);
        setIsConnected(false);
        setIsReady(false);
      }
    };

    setupSubscriptions();

    return () => {
      // Clean up subscriptions
      supabase.removeChannel(messageSubscription);
      supabase.removeChannel(presenceSubscription);
    };
  }, [channelName, user]);

  // Connection Health Check
  useEffect(() => {
    const checkConnectionHealth = () => {
      if (!isConnected) {
        setConnectionHealth('unstable');
        return;
      }

      // Implement more sophisticated checks here (e.g., ping server, check message latency)
      setConnectionHealth('healthy');
    };

    const intervalId = setInterval(checkConnectionHealth, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId);
  }, [isConnected]);

  // Reconnection Logic
  const reconnect = useCallback(async () => {
    if (connectionAttempts >= maxConnectionAttempts) {
      toast.error("Max reconnection attempts reached. Please refresh the page.");
      return;
    }

    setConnectionAttempts((prevAttempts) => prevAttempts + 1);
    setIsLoading(true);
    setError(null);

    // Simulate reconnection by tearing down and re-establishing subscriptions
    supabase.removeAllChannels().then(() => {
      toast.info(`Attempting to reconnect... (${connectionAttempts + 1}/${maxConnectionAttempts})`);
      // The setupSubscriptions function in the useEffect above will be triggered again
    });
  }, [connectionAttempts, maxConnectionAttempts]);

  // Send Message
  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      if (!user) {
        toast.error('You must be logged in to send messages.');
        return false;
      }

      if (!isConnected) {
        toast.error('Not connected to the chat. Please try again.');
        return false;
      }

      try {
        const messageObject = {
          channel_name: channelName,
          sender_id: user.id,
          content: content,
        };

        const { data, error } = await supabase.from('messages').insert([messageObject]).select().single();

        if (error) {
          toast.error(`Failed to send message: ${error.message}`);
          return false;
        }

        // Optimistically update the UI
        const newMessage = {
          ...data,
          sender: user, // Assuming user data is readily available
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        return true;
      } catch (err: any) {
        toast.error(err.message || 'Failed to send message.');
        return false;
      }
    },
    [channelName, user, isConnected]
  );

  // Delete Message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const { error } = await supabase.from('messages').delete().eq('id', messageId);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== messageId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete message.');
    }
  }, []);

  // Typing Indicator
  const startTyping = () => {
    if (!user || typingUsers.includes(user.id)) return;
    supabase.presence.track({ online: true });
    setTypingUsers((prevTypingUsers) => [...new Set([...prevTypingUsers, user.id])]);

    setTimeout(() => {
      setTypingUsers((prevTypingUsers) => prevTypingUsers.filter((typingUser) => typingUser !== user.id));
    }, 3000);
  };

  // Clear Unread Count
  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  return {
    messages,
    users,
    typingUsers,
    isConnected,
    isReady,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    startTyping,
    clearUnreadCount,
    reconnect,
    connectionHealth,
    diagnostics,
    connectionAttempts
  };
};
