
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface RealtimeChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  onlineUsers: string[];
  typingUsers: string[];
  channelId: string | null;
}

export function useRealtimeChat(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<RealtimeChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    onlineUsers: [],
    typingUsers: [],
    channelId: null
  });

  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxRetries = 5;

  const updateState = useCallback((updates: Partial<RealtimeChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize channel and load messages
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      updateState({ 
        isLoading: false, 
        error: 'Please sign in to access chat',
        isConnected: false 
      });
      return;
    }

    try {
      updateState({ isLoading: true, error: null });
      console.log('🚀 Initializing realtime chat for:', channelName);

      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Failed to find channel: ${channelError.message}`);
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

      // Auto-join user to channel
      await supabase
        .from('channel_members')
        .upsert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'member'
        }, { 
          onConflict: 'channel_id,user_id',
          ignoreDuplicates: true 
        });

      updateState({ channelId: channel.id });

      // Load existing messages
      await loadMessages(channel.id);

      // Setup real-time subscriptions
      setupMessageSubscription(channel.id);
      setupPresenceTracking(channelName);

      reconnectAttempts.current = 0;
      console.log('✅ Realtime chat initialized successfully');

    } catch (error) {
      console.error('💥 Failed to initialize chat:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
      updateState({ 
        error: errorMessage,
        isConnected: false,
        isLoading: false 
      });

      // Auto-retry with exponential backoff
      if (reconnectAttempts.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        console.log(`🔄 Retrying in ${delay}ms (attempt ${reconnectAttempts.current})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          initializeChat();
        }, delay);
      }
    }
  }, [user?.id, channelName, updateState]);

  // Load messages for channel
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);

      const { data: messages, error } = await supabase
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
        .limit(100);

      if (error) {
        console.error('❌ Failed to load messages:', error);
        updateState({ messages: [] });
        return;
      }

      const formattedMessages = (messages || []).map(msg => ({
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

      updateState({ messages: formattedMessages, isLoading: false });
      console.log(`✅ Loaded ${formattedMessages.length} messages`);

    } catch (error) {
      console.error('💥 Exception loading messages:', error);
      updateState({ messages: [], isLoading: false });
    }
  }, [updateState]);

  // Setup message subscription
  const setupMessageSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up message subscription for:', channelId);

    const subscription = supabase
      .channel(`messages_${channelId}`)
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

          // Skip if it's from current user (avoid duplication)
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
        console.log('📡 Message subscription status:', status);
        updateState({ 
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : 'Connection issues'
        });

        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Auto-reconnect with delay
          if (reconnectAttempts.current < maxRetries) {
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              setupMessageSubscription(channelId);
            }, 3000);
          }
        }
      });

    subscriptionRef.current = subscription;
  }, [user?.id, updateState]);

  // Setup presence tracking
  const setupPresenceTracking = useCallback((channelName: string) => {
    if (!user?.id) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    console.log('👥 Setting up presence tracking for:', channelName);

    presenceChannelRef.current = supabase
      .channel(`presence_${channelName}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState();
        const users = Object.keys(state || {});
        updateState({ onlineUsers: users });
        console.log('👥 Online users synced:', users.length);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        console.log('👋 User joined:', key);
        setState(prev => ({
          ...prev,
          onlineUsers: [...new Set([...prev.onlineUsers, key])]
        }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('👋 User left:', key);
        setState(prev => ({
          ...prev,
          onlineUsers: prev.onlineUsers.filter(u => u !== key)
        }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            online_at: new Date().toISOString()
          });
          console.log('✅ Presence tracking started');
        }
      });
  }, [user, updateState]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !state.channelId || !content.trim()) {
      if (!user?.id) toast.error("Please sign in to send messages");
      return false;
    }

    try {
      console.log('📤 Sending message:', content.trim());

      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: state.channelId,
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
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, state.channelId]);

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
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      toast.success("Message deleted");
      return true;
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    reconnectAttempts.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount and cleanup
  useEffect(() => {
    initializeChat();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [initializeChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    reconnect,
    // Additional utilities
    isReady: state.isConnected && !state.isLoading && !state.error,
    userCount: state.onlineUsers.length
  };
}
