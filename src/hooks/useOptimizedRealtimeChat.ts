import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface OptimizedChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  reconnect: () => void;
}

interface ConnectionStats {
  lastMessageTime: number;
  missedHeartbeats: number;
  reconnectAttempts: number;
}

export function useOptimizedRealtimeChat(channelName: string): OptimizedChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  const [channelId, setChannelId] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const channelInitialized = useRef<string | null>(null);
  const connectionStats = useRef<ConnectionStats>({
    lastMessageTime: Date.now(),
    missedHeartbeats: 0,
    reconnectAttempts: 0
  });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🚀 OptimizedRealtimeChat initialized for channel:', channelName);

  // Enhanced connection health monitoring
  const updateConnectionHealth = useCallback(() => {
    const now = Date.now();
    const timeSinceLastMessage = now - connectionStats.current.lastMessageTime;
    const { missedHeartbeats, reconnectAttempts } = connectionStats.current;

    if (!isConnected) {
      setConnectionHealth('disconnected');
    } else if (timeSinceLastMessage < 30000 && missedHeartbeats === 0) {
      setConnectionHealth('excellent');
    } else if (timeSinceLastMessage < 60000 && missedHeartbeats < 3) {
      setConnectionHealth('good');
    } else if (reconnectAttempts < 3) {
      setConnectionHealth('poor');
    } else {
      setConnectionHealth('disconnected');
    }
  }, [isConnected]);

  // Enhanced channel creation/retrieval
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting or creating channel:', name);
      
      // Try to find existing channel first
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .limit(1)
        .single();

      if (!error && channel) {
        console.log('✅ Found existing channel:', channel.id);
        return channel.id;
      }

      // Channel doesn't exist, create it
      if (error && error.code === 'PGRST116') {
        console.log('📝 Creating new channel:', name);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: name,
            type: 'public',
            description: getChannelDescription(name),
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          // Handle race condition where channel was created by another user
          if (createError.code === '23505') {
            console.log('🔄 Race condition detected, fetching existing channel...');
            const { data: existingChannel } = await supabase
              .from('channels')
              .select('id')
              .eq('name', name)
              .eq('type', 'public')
              .limit(1)
              .single();
            
            return existingChannel?.id || null;
          }
          throw createError;
        }

        console.log('✅ Created new channel:', newChannel.id);
        return newChannel.id;
      }

      throw error;
      
    } catch (err) {
      console.error('❌ Error in getOrCreateChannel:', err);
      return null;
    }
  }, [user?.id]);

  const getChannelDescription = (name: string): string => {
    const descriptions: Record<string, string> = {
      'general': 'General discussion and community chat',
      'morning journey': 'Start your day with motivation and morning routines',
      'announcement': 'Important announcements and updates',
      'random': 'Random conversations and off-topic discussions',
      'help': 'Ask questions and get help from the community'
    };
    
    return descriptions[name.toLowerCase()] || `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`;
  };

  // Enhanced message loading with better error handling
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      connectionStats.current.lastMessageTime = Date.now();
      console.log('✅ Loaded', formattedMessages.length, 'messages');
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
    }
  }, []);

  // Enhanced realtime subscription with better error handling
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up enhanced realtime subscription for channel:', channelId);
    
    const subscription = supabase
      .channel(`enhanced_community_${channelId}`)
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
          
          try {
            // Get sender profile with error handling
            const { data: sender, error: senderError } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            if (senderError) {
              console.warn('⚠️ Could not fetch sender profile:', senderError);
            }

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

            connectionStats.current.lastMessageTime = Date.now();
            connectionStats.current.missedHeartbeats = 0;
            
          } catch (err) {
            console.error('❌ Error processing new message:', err);
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
          console.log('🔄 Message updated:', payload);
          const updatedMessage = payload.new as any;
          
          setMessages(prev => 
            prev.filter(msg => msg.id !== updatedMessage.id || !updatedMessage.is_deleted)
          );
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Enhanced subscription status:', status, err);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          connectionStats.current.reconnectAttempts = 0;
          connectionStats.current.missedHeartbeats = 0;
          setError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          connectionStats.current.reconnectAttempts++;
          setError(`Connection ${status.toLowerCase()}`);
          
          // Auto-reconnect with exponential backoff
          if (connectionStats.current.reconnectAttempts < 5) {
            const delay = Math.min(1000 * Math.pow(2, connectionStats.current.reconnectAttempts), 30000);
            console.log(`🔄 Auto-reconnecting in ${delay}ms (attempt ${connectionStats.current.reconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnect();
            }, delay);
          }
        }
      });

    subscriptionRef.current = subscription;
  }, []);

  // Enhanced message sending with optimistic updates
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) return false;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: (user as any).user_metadata?.full_name || 'You',
        avatar_url: (user as any).user_metadata?.avatar_url || null
      }
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        })
        .select('id')
        .single();

      if (error) throw error;

      // Replace optimistic message with real one
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { ...optimisticMessage, id: data.id }
            : msg
        )
      );

      return true;
      
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

  // Enhanced message deletion
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    // Optimistically remove message
    const originalMessages = messages;
    setMessages(prev => prev.filter(msg => msg.id !== messageId));

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
      toast.success('Message deleted');
      
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      
      // Restore messages on error
      setMessages(originalMessages);
      toast.error('Failed to delete message');
    }
  }, [user?.id, messages]);

  // Manual reconnection
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    if (channelId) {
      setupRealtimeSubscription(channelId);
    }
  }, [channelId, setupRealtimeSubscription]);

  // Initialize chat
  const initializeChat = useCallback(async (targetChannelName: string) => {
    if (!user?.id || !targetChannelName) {
      setIsLoading(false);
      return;
    }

    if (channelInitialized.current === targetChannelName) {
      console.log('⚠️ Channel already initialized:', targetChannelName);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Initializing enhanced chat for channel:', targetChannelName);

      const channelResult = await getOrCreateChannel(targetChannelName);
      if (!channelResult) {
        throw new Error('Failed to get or create channel');
      }

      setChannelId(channelResult);
      channelInitialized.current = targetChannelName;

      await loadMessages(channelResult);
      setupRealtimeSubscription(channelResult);

      console.log('✅ Enhanced chat initialized successfully for channel:', targetChannelName);
      
    } catch (err) {
      console.error('❌ Failed to initialize enhanced chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  // Start heartbeat monitoring
  useEffect(() => {
    if (isConnected) {
      heartbeatIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastMessage = now - connectionStats.current.lastMessageTime;
        
        if (timeSinceLastMessage > 60000) {
          connectionStats.current.missedHeartbeats++;
          console.log('💓 Heartbeat missed, count:', connectionStats.current.missedHeartbeats);
          
          if (connectionStats.current.missedHeartbeats > 3) {
            console.log('💔 Too many missed heartbeats, reconnecting...');
            reconnect();
          }
        }
        
        updateConnectionHealth();
      }, 30000);
    }

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [isConnected, reconnect, updateConnectionHealth]);

  // Initialize chat when channel changes
  useEffect(() => {
    if (channelName && channelName !== channelInitialized.current) {
      setMessages([]);
      setError(null);
      setIsConnected(false);
      setConnectionHealth('disconnected');
      channelInitialized.current = null;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      initializeChat(channelName);
    }
  }, [channelName, initializeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up enhanced subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  if (!user?.id) {
    return null;
  }

  return {
    messages,
    isLoading,
    error,
    isConnected,
    connectionHealth,
    sendMessage,
    deleteMessage,
    reconnect
  };
}