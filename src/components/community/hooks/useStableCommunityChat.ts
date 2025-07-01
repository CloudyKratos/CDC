
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseStableCommunityChat {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  onlineUsers: string[];
  isTyping: boolean;
  startTyping: () => void;
  stopTyping: () => void;
  reconnect: () => void;
}

export function useStableCommunityChat(channelName: string): UseStableCommunityChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const offlineQueueRef = useRef<string[]>([]);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Initialize channel and load messages
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Initializing stable chat for:', channelName);

      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Channel lookup failed: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 Creating new channel:', channelName);
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

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        channel = newChannel;
      }

      setChannelId(channel.id);

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
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.warn('⚠️ Could not load messages:', messagesError);
        setMessages([]);
      } else {
        const formattedMessages = (existingMessages || []).map(msg => ({
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

      // Setup real-time subscriptions
      setupRealtimeSubscriptions(channel.id);
      setupPresenceTracking(channelName);
      
      setIsConnected(true);
      setIsLoading(false);
      retryCountRef.current = 0;
      
      // Process offline queue
      await processOfflineQueue();
      
      console.log('✅ Stable chat initialized successfully');

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      setIsConnected(false);
      setIsLoading(false);
      
      // Auto-retry with exponential backoff
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryCountRef.current++;
        setTimeout(initializeChat, delay);
      }
    }
  }, [user?.id, channelName]);

  // Setup real-time message subscriptions
  const setupRealtimeSubscriptions = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up stable real-time subscription');
    
    subscriptionRef.current = supabase
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
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;
          
          // Skip if message is from current user (avoid duplication)
          if (newMessage.sender_id === user?.id) {
            return;
          }
          
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
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          // Auto-reconnect after delay
          setTimeout(() => {
            if (retryCountRef.current < maxRetries) {
              reconnect();
            }
          }, 3000);
        }
      });
  }, [user?.id]);

  // Setup user presence tracking
  const setupPresenceTracking = useCallback((channelName: string) => {
    if (!user?.id) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    presenceChannelRef.current = supabase
      .channel(`presence_${channelName}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState();
        const users = Object.keys(state || {});
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => [...new Set([...prev, key])]);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => prev.filter(u => u !== key));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({
            user_id: user.id,
            username: user.user_metadata?.username || 'Anonymous',
            online_at: new Date().toISOString()
          });
        }
      });
  }, [user?.id]);

  // Enhanced send message with retry logic
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !user?.id || !channelId) {
      if (!user?.id) toast.error("Please sign in to send messages");
      return false;
    }

    // If offline, queue message
    if (!isConnected) {
      offlineQueueRef.current.push(content);
      toast.info("Message queued - will send when connection is restored");
      return true;
    }

    try {
      console.log('📤 Sending message with retry logic');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      return true;

    } catch (error) {
      console.error('💥 Failed to send message:', error);
      
      // Queue message for retry if it's a network issue
      if (error instanceof Error && error.message.includes('network')) {
        offlineQueueRef.current.push(content);
        toast.error("Network error - message queued for retry");
      } else {
        toast.error('Failed to send message');
      }
      return false;
    }
  }, [user?.id, channelId, isConnected]);

  // Enhanced delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      toast.success("Message deleted", { duration: 1000 });
      return true;
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Process offline message queue
  const processOfflineQueue = useCallback(async () => {
    if (offlineQueueRef.current.length === 0 || !isConnected) return;

    console.log('📤 Processing offline queue:', offlineQueueRef.current.length, 'messages');
    
    const queue = [...offlineQueueRef.current];
    offlineQueueRef.current = [];

    for (const content of queue) {
      await sendMessage(content);
      // Small delay between messages to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }, [isConnected, sendMessage]);

  // Typing indicators
  const startTyping = useCallback(() => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
  }, []);

  const stopTyping = useCallback(() => {
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setError(null);
    retryCountRef.current = 0;
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount and channel change
  useEffect(() => {
    initializeChat();
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [initializeChat]);

  // Process offline queue when connection is restored
  useEffect(() => {
    if (isConnected && offlineQueueRef.current.length > 0) {
      processOfflineQueue();
    }
  }, [isConnected, processOfflineQueue]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    deleteMessage,
    onlineUsers,
    isTyping,
    startTyping,
    stopTyping,
    reconnect
  };
}
