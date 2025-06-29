
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description?: string;
  member_count: number;
}

interface ChatState {
  messages: Message[];
  channels: Channel[];
  activeChannel: string;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  onlineUsers: number;
}

export function useCommunityChat(defaultChannel: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    channels: [],
    activeChannel: defaultChannel,
    isConnected: false,
    isLoading: true,
    error: null,
    onlineUsers: 0
  });
  
  const subscriptionRef = useRef<any>(null);
  const channelIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  // Update state helper
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log(`🔍 Getting channel: ${channelName}`);
      
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!channel) {
        console.log(`📝 Creating channel: ${channelName}`);
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

        if (createError) throw createError;
        channel = newChannel;
      }

      return channel.id;
    } catch (error) {
      console.error('❌ Channel error:', error);
      updateState({ error: 'Failed to access channel' });
      return null;
    }
  }, [user?.id, updateState]);

  // Load messages for channel
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log(`📥 Loading messages for: ${channelId}`);
      
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
        .limit(50);

      if (error) throw error;

      const formattedMessages = (messages || []).map(msg => ({
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

      updateState({ messages: formattedMessages });
      console.log(`✅ Loaded ${formattedMessages.length} messages`);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      updateState({ messages: [], error: 'Failed to load messages' });
    }
  }, [updateState]);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up old subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log(`📡 Setting up realtime for: ${channelId}`);
    
    const subscription = supabase
      .channel(`chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Get sender info
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

          setState(prev => {
            const exists = prev.messages.some(msg => msg.id === message.id);
            if (exists) return prev;
            return { ...prev, messages: [...prev.messages, message] };
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
        console.log(`📡 Subscription status: ${status}`);
        
        if (status === 'SUBSCRIBED') {
          updateState({ isConnected: true, error: null });
          reconnectAttempts.current = 0;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          updateState({ isConnected: false });
          
          // Auto-reconnect with exponential backoff
          if (reconnectAttempts.current < 5) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            reconnectTimeoutRef.current = setTimeout(() => {
              reconnectAttempts.current++;
              if (channelIdRef.current) {
                setupRealtimeSubscription(channelIdRef.current);
              }
            }, delay);
          }
        }
      });

    subscriptionRef.current = subscription;
  }, [updateState]);

  // Initialize chat
  const initializeChat = useCallback(async (channelName: string) => {
    if (!user?.id) {
      updateState({ isLoading: false, error: 'Please log in to access chat' });
      return;
    }

    updateState({ isLoading: true, error: null, activeChannel: channelName });

    try {
      const channelId = await getOrCreateChannel(channelName);
      if (!channelId) return;

      channelIdRef.current = channelId;
      await loadMessages(channelId);
      setupRealtimeSubscription(channelId);
      
      updateState({ isLoading: false });
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      updateState({ 
        isLoading: false, 
        error: 'Failed to connect to chat. Retrying...' 
      });
    }
  }, [user?.id, getOrCreateChannel, loadMessages, setupRealtimeSubscription, updateState]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelIdRef.current || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
      toast.success('Message deleted');
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Switch channel
  const switchChannel = useCallback((channelName: string) => {
    if (channelName !== state.activeChannel) {
      initializeChat(channelName);
    }
  }, [state.activeChannel, initializeChat]);

  // Initialize on mount
  useEffect(() => {
    initializeChat(defaultChannel);
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [defaultChannel, initializeChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    switchChannel,
    reconnect: () => initializeChat(state.activeChannel)
  };
}
