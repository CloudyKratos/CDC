
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ChatUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  is_typing: boolean;
}

interface ChatState {
  messages: Message[];
  users: ChatUser[];
  typingUsers: string[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  unreadCount: number;
}

export function useUnifiedCommunityChat(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    users: [],
    typingUsers: [],
    isConnected: false,
    isLoading: true,
    error: null,
    hasMoreMessages: true,
    unreadCount: 0
  });

  const subscriptionRef = useRef<any>(null);
  const presenceRef = useRef<any>(null);
  const channelIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageCache = useRef<Map<string, Message>>(new Map());
  const lastMessageId = useRef<string | null>(null);

  // Update state helper
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (!channel) {
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name,
            type: 'public',
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`,
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

  // Load messages with pagination
  const loadMessages = useCallback(async (channelId: string, before?: string) => {
    try {
      let query = supabase
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
        .order('created_at', { ascending: false })
        .limit(50);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data: messages, error } = await query;
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
      })).reverse();

      // Cache messages
      formattedMessages.forEach(msg => {
        messageCache.current.set(msg.id, msg);
      });

      if (before) {
        updateState({ 
          messages: [...formattedMessages, ...state.messages],
          hasMoreMessages: messages?.length === 50
        });
      } else {
        updateState({ 
          messages: formattedMessages,
          hasMoreMessages: messages?.length === 50
        });
      }

      if (formattedMessages.length > 0) {
        lastMessageId.current = formattedMessages[formattedMessages.length - 1].id;
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      updateState({ error: 'Failed to load messages' });
    }
  }, [updateState, state.messages]);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    const subscription = supabase
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
          const newMessage = payload.new as any;
          
          // Avoid duplicates
          if (messageCache.current.has(newMessage.id)) return;

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

          messageCache.current.set(message.id, message);
          setState(prev => ({
            ...prev,
            messages: [...prev.messages, message],
            unreadCount: message.sender_id !== user?.id ? prev.unreadCount + 1 : prev.unreadCount
          }));
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
            messageCache.current.delete(updatedMessage.id);
            setState(prev => ({
              ...prev,
              messages: prev.messages.filter(msg => msg.id !== updatedMessage.id)
            }));
          }
        }
      )
      .subscribe((status) => {
        updateState({ isConnected: status === 'SUBSCRIBED' });
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Auto-reconnect with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, Math.floor(Math.random() * 5)), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            if (channelIdRef.current) {
              setupRealtimeSubscription(channelIdRef.current);
            }
          }, delay);
        }
      });

    subscriptionRef.current = subscription;
  }, [user?.id, updateState]);

  // Setup presence tracking
  const setupPresence = useCallback((channelId: string) => {
    if (!user?.id) return;

    const presence = supabase.channel(`presence_${channelId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presence.presenceState();
        const onlineUsers = Object.values(presenceState).flat() as any[];
        
        updateState({
          users: onlineUsers.map(u => ({
            id: u.user_id,
            username: u.username,
            full_name: u.full_name,
            avatar_url: u.avatar_url,
            is_online: true,
            last_seen: new Date().toISOString(),
            is_typing: false
          }))
        });
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('👋 User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('👋 User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presence.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            full_name: user.email?.split('@')[0] || 'Anonymous User',
            avatar_url: null,
            online_at: new Date().toISOString()
          });
        }
      });

    presenceRef.current = presence;
  }, [user, updateState]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
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

  // Typing indicators
  const startTyping = useCallback(() => {
    if (!channelIdRef.current || !user?.id) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Broadcast typing status
    const typingChannel = supabase.channel(`typing_${channelIdRef.current}`);
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id, is_typing: true }
    });

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      typingChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: user.id, is_typing: false }
      });
    }, 3000);
  }, [user?.id]);

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (!channelIdRef.current || !state.hasMoreMessages || state.isLoading) return;

    const oldestMessage = state.messages[0];
    if (oldestMessage) {
      updateState({ isLoading: true });
      await loadMessages(channelIdRef.current, oldestMessage.created_at);
      updateState({ isLoading: false });
    }
  }, [channelIdRef.current, state.hasMoreMessages, state.isLoading, state.messages, loadMessages, updateState]);

  // Clear unread count
  const clearUnreadCount = useCallback(() => {
    updateState({ unreadCount: 0 });
  }, [updateState]);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      updateState({ isLoading: false, error: 'Please log in to access chat' });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const channelId = await getOrCreateChannel(channelName);
      if (!channelId) return;

      channelIdRef.current = channelId;
      await loadMessages(channelId);
      setupRealtimeSubscription(channelId);
      setupPresence(channelId);
      
      updateState({ isLoading: false });
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      updateState({ 
        isLoading: false, 
        error: 'Failed to connect to chat' 
      });
    }
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription, setupPresence, updateState]);

  // Reconnect
  const reconnect = useCallback(() => {
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount
  useEffect(() => {
    initializeChat();
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (presenceRef.current) {
        supabase.removeChannel(presenceRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [initializeChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    startTyping,
    loadMoreMessages,
    clearUnreadCount,
    reconnect,
    isReady: !!user?.id && !!channelIdRef.current
  };
}
