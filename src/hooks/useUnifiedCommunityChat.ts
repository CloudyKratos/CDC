import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCircuitBreaker } from './useCircuitBreaker';
import { useConnectionDiagnostics } from './useConnectionDiagnostics';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface UseUnifiedCommunityChatReturn {
  messages: Message[];
  users: User[];
  typingUsers: string[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  unreadCount: number;
  sendMessage: (content: string, attachments?: Array<{url: string, name: string, type: string, size: number}>) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  startTyping: () => void;
  loadMoreMessages: () => Promise<void>;
  clearUnreadCount: () => void;
  reconnect: () => void;
  isReady: boolean;
  connectionHealth: 'healthy' | 'degraded' | 'failed';
  diagnostics: any;
}

export function useUnifiedCommunityChat(channelName: string): UseUnifiedCommunityChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<'healthy' | 'degraded' | 'failed'>('failed');
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Enhanced error handling with circuit breaker
  const circuitBreaker = useCircuitBreaker({
    failureThreshold: 3,
    resetTimeoutMs: 30000,
    successThreshold: 2
  });

  const { diagnostics, runDiagnostics, startPeriodicCheck, stopPeriodicCheck } = useConnectionDiagnostics();

  // Enhanced channel creation with better error handling
  const ensureUserInChannel = useCallback(async (channelId: string, userId: string) => {
    try {
      await circuitBreaker.execute(async () => {
        const { error } = await supabase
          .from('channel_members')
          .insert({
            channel_id: channelId,
            user_id: userId,
            role: 'member'
          });

        // Ignore unique constraint violations (user already in channel)
        if (error && !error.message.includes('duplicate key') && !error.message.includes('unique')) {
          console.warn('⚠️ Could not add user to channel:', error);
          throw error;
        }
      });
    } catch (error) {
      console.warn('⚠️ Error ensuring user in channel:', error);
      // Don't throw - this is not critical for chat functionality
    }
  }, [circuitBreaker]);

  // Enhanced message loading with circuit breaker
  const loadMessages = useCallback(async (channelId: string, offset = 0) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const messagesData = await circuitBreaker.execute(async () => {
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
          .eq('channel_id', channelId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .range(offset, offset + 49);

        if (error) {
          console.error('❌ Error loading messages:', error);
          throw error;
        }

        return data || [];
      });

      const formattedMessages = messagesData.map(msg => ({
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

      if (offset === 0) {
        setMessages(formattedMessages);
      } else {
        setMessages(prev => [...formattedMessages, ...prev]);
      }

      setHasMoreMessages(formattedMessages.length === 50);
      console.log(`✅ Loaded ${formattedMessages.length} messages`);
      
      // Update connection health on success
      setConnectionHealth('healthy');
    } catch (error) {
      console.error('💥 Exception loading messages:', error);
      setConnectionHealth('degraded');
      
      // Still allow chat to function with existing messages
      if (offset === 0 && messages.length === 0) {
        setMessages([]);
      }
    }
  }, [circuitBreaker, messages.length]);

  // Initialize chat connection with enhanced error handling
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName) {
      console.log('❌ Missing user or channel name');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Initializing unified chat for:', channelName);

      // Run diagnostics first
      const healthCheck = await runDiagnostics();
      if (!healthCheck.isHealthy) {
        console.warn('⚠️ Connection diagnostics show issues, proceeding with degraded mode');
        setConnectionHealth('degraded');
      } else {
        setConnectionHealth('healthy');
      }

      // Get or create channel with circuit breaker protection
      const channel = await circuitBreaker.execute(async () => {
        let { data: existingChannel, error: channelError } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName)
          .eq('type', 'public')
          .maybeSingle();

        if (channelError && channelError.code !== 'PGRST116') {
          throw new Error(`Channel lookup failed: ${channelError.message}`);
        }

        if (!existingChannel) {
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
          existingChannel = newChannel;
        }

        return existingChannel;
      });

      setChannelId(channel.id);

      // Auto-join user to channel
      await ensureUserInChannel(channel.id, user.id);

      // Load messages
      await loadMessages(channel.id);

      // Setup real-time subscriptions
      setupRealtimeSubscription(channel.id);
      setupPresenceTracking(channelName);
      
      setIsConnected(true);
      setIsReady(true);
      setIsLoading(false);
      reconnectAttempts.current = 0;
      
      console.log('✅ Unified chat initialized successfully');

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setError(errorMessage);
      setIsConnected(false);
      setIsReady(false);
      setIsLoading(false);
      setConnectionHealth('failed');
      
      // Auto-retry with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log(`🔄 Retry attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
          initializeChat();
        }, delay);
      } else {
        toast.error('Failed to connect to chat. Please refresh the page.');
      }
    }
  }, [user?.id, channelName, circuitBreaker, runDiagnostics, ensureUserInChannel, loadMessages]);

  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up old subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up real-time subscription');
    
    subscriptionRef.current = supabase
      .channel(`unified_chat_${channelId}`)
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

          // Increment unread count if message is not from current user
          if (newMessage.sender_id !== user?.id) {
            setUnreadCount(prev => prev + 1);
          }
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
        
        if (status === 'SUBSCRIBED') {
          circuitBreaker.recordSuccess();
          setConnectionHealth('healthy');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          circuitBreaker.recordFailure();
          setConnectionHealth('degraded');
          
          // Auto-reconnect after delay
          setTimeout(() => {
            if (reconnectAttempts.current < maxReconnectAttempts && circuitBreaker.canExecute()) {
              reconnect();
            }
          }, 3000);
        }
      });
  }, [user?.id, circuitBreaker]);

  const setupPresenceTracking = useCallback((channelName: string) => {
    if (!user?.id) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    presenceChannelRef.current = supabase
      .channel(`presence_${channelName}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState();
        const onlineUsers = Object.values(state || {}).flat().map((presence: any) => ({
          id: presence.user_id,
          username: presence.username,
          full_name: presence.full_name,
          is_online: true
        }));
        setUsers(onlineUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((presence: any) => ({
          id: presence.user_id,
          username: presence.username,
          full_name: presence.full_name,
          is_online: true
        }));
        setUsers(prev => [...prev.filter(u => !newUsers.find(nu => nu.id === u.id)), ...newUsers]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.user_id);
        setUsers(prev => prev.filter(u => !leftUserIds.includes(u.id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            full_name: user.email || 'Anonymous User',
            online_at: new Date().toISOString()
          });
        }
      });
  }, [user]);

  // Enhanced send message with circuit breaker
  const sendMessage = useCallback(async (content: string, attachments?: Array<{url: string, name: string, type: string, size: number}>): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) {
      toast.error("Cannot send message");
      return false;
    }

    if (!circuitBreaker.canExecute()) {
      toast.error("Connection is temporarily unavailable - please wait");
      return false;
    }

    try {
      console.log('📤 Sending message');
      
      await circuitBreaker.execute(async () => {
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
      });

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId, circuitBreaker]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await circuitBreaker.execute(async () => {
        const { error } = await supabase
          .from('community_messages')
          .update({ is_deleted: true })
          .eq('id', messageId)
          .eq('sender_id', user.id);

        if (error) {
          throw new Error(`Failed to delete message: ${error.message}`);
        }
      });

      console.log('✅ Message deleted successfully');
      toast.success("Message deleted", { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id, circuitBreaker]);

  const startTyping = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      // Remove typing indicator after 3 seconds
    }, 3000);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (!channelId || isLoading || !hasMoreMessages) return;
    
    setIsLoading(true);
    await loadMessages(channelId, messages.length);
    setIsLoading(false);
  }, [channelId, isLoading, hasMoreMessages, messages.length, loadMessages]);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setError(null);
    reconnectAttempts.current = 0;
    circuitBreaker.reset();
    initializeChat();
  }, [initializeChat, circuitBreaker]);

  // Initialize on mount and start health monitoring
  useEffect(() => {
    initializeChat();
    startPeriodicCheck(30000); // Check health every 30 seconds
    
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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopPeriodicCheck();
    };
  }, [initializeChat, startPeriodicCheck, stopPeriodicCheck]);

  return {
    messages,
    users,
    typingUsers,
    isConnected,
    isLoading,
    error,
    hasMoreMessages,
    unreadCount,
    sendMessage,
    deleteMessage,
    startTyping,
    loadMoreMessages,
    clearUnreadCount,
    reconnect,
    isReady,
    connectionHealth,
    diagnostics
  };
}
