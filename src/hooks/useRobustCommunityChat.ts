
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RobustChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  isReady: boolean;
  connectionAttempts: number;
}

export function useRobustCommunityChat(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<RobustChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    isReady: false,
    connectionAttempts: 0
  });

  const subscriptionRef = useRef<any>(null);
  const channelIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Get or create channel with proper error handling
  const getOrCreateChannel = useCallback(async (): Promise<string | null> => {
    try {
      console.log('🔍 Looking for channel:', channelName);
      
      // First try to get existing channel
      const { data: existingChannel, error: getError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .limit(1)
        .maybeSingle();

      if (getError) {
        console.error('❌ Error getting channel:', getError);
        return null;
      }

      if (existingChannel) {
        console.log('✅ Found existing channel:', existingChannel.id);
        return existingChannel.id;
      }

      // Create new channel if it doesn't exist
      if (!user?.id) {
        console.error('❌ No user ID for channel creation');
        return null;
      }

      console.log('📝 Creating new channel:', channelName);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          description: `${channelName} discussion`,
          created_by: user.id
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating channel:', createError);
        return null;
      }

      console.log('✅ Created new channel:', newChannel.id);
      return newChannel.id;
    } catch (error) {
      console.error('💥 Exception in getOrCreateChannel:', error);
      return null;
    }
  }, [channelName, user?.id]);

  // Load messages with separate profile queries
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      // Get messages without complex joins to avoid foreign key issues
      const { data: rawMessages, error: messagesError } = await supabase
        .from('community_messages')
        .select('id, content, created_at, sender_id')
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.error('❌ Error loading messages:', messagesError);
        setState(prev => ({ ...prev, error: 'Failed to load messages' }));
        return;
      }

      if (!rawMessages || rawMessages.length === 0) {
        console.log('📭 No messages found');
        setState(prev => ({ ...prev, messages: [] }));
        return;
      }

      // Get unique sender IDs
      const senderIds = [...new Set(rawMessages.map(msg => msg.sender_id))];
      
      // Fetch profiles for all senders separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      if (profilesError) {
        console.warn('⚠️ Error loading profiles:', profilesError);
      }

      // Create a profile lookup map
      const profileMap = new Map();
      profiles?.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      // Combine messages with profiles
      const formattedMessages = rawMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: profileMap.get(msg.sender_id) || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setState(prev => ({ ...prev, messages: formattedMessages }));
      console.log(`✅ Loaded ${formattedMessages.length} messages`);

    } catch (error) {
      console.error('💥 Exception loading messages:', error);
      setState(prev => ({ ...prev, error: 'Failed to load messages' }));
    }
  }, []);

  // Setup realtime subscription with retry logic
  const setupRealtime = useCallback((channelId: string) => {
    cleanup(); // Clean up any existing subscriptions

    console.log('📡 Setting up realtime for channel:', channelId);

    const channel = supabase
      .channel(`robust_chat_${channelId}`)
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

          setState(prev => {
            const exists = prev.messages.some(msg => msg.id === message.id);
            if (exists) return prev;
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
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
            setState(prev => ({
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== updatedMessage.id)
            }));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : prev.error
        }));

        // If subscription fails, start polling fallback
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('🔄 Realtime failed, starting polling fallback');
          startPollingFallback(channelId);
        }
      });

    subscriptionRef.current = channel;
  }, [cleanup]);

  // Polling fallback when realtime fails
  const startPollingFallback = useCallback((channelId: string) => {
    if (pollingIntervalRef.current) return; // Already polling

    console.log('📊 Starting polling fallback');
    pollingIntervalRef.current = setInterval(() => {
      loadMessages(channelId);
    }, 5000); // Poll every 5 seconds
  }, [loadMessages]);

  // Automatic reconnection with exponential backoff
  const reconnect = useCallback(async () => {
    if (!channelIdRef.current) return;

    setState(prev => ({
      ...prev,
      connectionAttempts: prev.connectionAttempts + 1,
      error: null
    }));

    const backoffDelay = Math.min(1000 * Math.pow(2, state.connectionAttempts), 30000);
    
    console.log(`🔄 Reconnecting in ${backoffDelay}ms (attempt ${state.connectionAttempts + 1})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      setupRealtime(channelIdRef.current!);
    }, backoffDelay);
  }, [state.connectionAttempts, setupRealtime]);

  // Initialize chat system
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('🚀 Initializing robust chat system...');

      // Ensure user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            email: user.email
          });

        if (createError) {
          console.error('❌ Profile creation failed:', createError);
        } else {
          console.log('✅ User profile created');
        }
      }

      // Get or create channel
      const channelId = await getOrCreateChannel();
      if (!channelId) {
        throw new Error('Failed to get or create channel');
      }

      channelIdRef.current = channelId;

      // Load messages and setup realtime
      await loadMessages(channelId);
      setupRealtime(channelId);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
        connectionAttempts: 0
      }));

      console.log('✅ Robust chat system initialized');

    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize chat',
        isLoading: false,
        isReady: false
      }));

      // Retry initialization
      setTimeout(() => {
        console.log('🔄 Retrying initialization...');
        initializeChat();
      }, 3000);
    }
  }, [user?.id, getOrCreateChannel, loadMessages, setupRealtime]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelIdRef.current || !content.trim()) {
      console.error('❌ Cannot send message - missing requirements');
      return false;
    }

    try {
      console.log('📤 Sending message...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Send message error:', error);
        toast.error('Failed to send message');
        return false;
      }

      console.log('✅ Message sent');
      return true;
    } catch (error) {
      console.error('💥 Send message failed:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete error:', error);
        toast.error('Failed to delete message');
        return false;
      }

      console.log('✅ Message deleted');
      return true;
    } catch (error) {
      console.error('💥 Delete failed:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Manual reconnect
  const manualReconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setState(prev => ({ ...prev, error: null, connectionAttempts: 0 }));
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount
  useEffect(() => {
    console.log('🔧 Robust community chat mounting...');
    initializeChat();

    return () => {
      console.log('🧹 Robust community chat cleanup');
      cleanup();
    };
  }, [initializeChat, cleanup]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!state.isConnected && state.isReady && state.connectionAttempts < 5) {
      reconnect();
    }
  }, [state.isConnected, state.isReady, state.connectionAttempts, reconnect]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    reconnect: manualReconnect
  };
}
