
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseSimpleChat {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  reconnect: () => void;
  isReady: boolean;
}

export function useSimpleChat(channelName: string): UseSimpleChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;
  const initializingRef = useRef(false);

  console.log('🎯 useSimpleChat hook called for channel:', channelName);

  // Clean up subscription
  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up subscription for channel:', channelName);
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  }, [channelName]);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id || !name) return null;

    try {
      console.log('🔍 Getting or creating channel:', name);
      
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Channel lookup failed: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 Creating new channel:', name);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: name,
            type: 'public',
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        channel = newChannel;
      }

      console.log('✅ Found existing channel:', channel.id);
      return channel.id;
    } catch (err) {
      console.error('💥 Failed to get/create channel:', err);
      throw err;
    }
  }, [user?.id]);

  // Load messages for channel
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messagesData, error: messagesError } = await supabase
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

      if (messagesError) {
        console.warn('⚠️ Could not load messages:', messagesError);
        setMessages([]);
        return;
      }

      const formattedMessages = (messagesData || []).map(msg => ({
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

      console.log('✅ Loaded messages:', formattedMessages.length);
      setMessages(formattedMessages);
    } catch (err) {
      console.error('💥 Failed to load messages:', err);
      setMessages([]);
    }
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    cleanupSubscription();

    console.log('📡 Setting up realtime subscription for channel:', channelId);
    
    const subscription = supabase
      .channel(`simple_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('📨 New message received via realtime:', payload);
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
        console.log('📡 Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          if (retryCountRef.current < maxRetries) {
            setTimeout(() => {
              reconnect();
            }, 3000);
          }
        }
      });

    subscriptionRef.current = subscription;
  }, [cleanupSubscription]);

  // Initialize chat for channel
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName || initializingRef.current) {
      return;
    }

    initializingRef.current = true;
    setIsLoading(true);
    setError(null);
    setIsReady(false);

    try {
      console.log('🚀 Initializing chat for channel:', channelName);

      const id = await getOrCreateChannel(channelName);
      if (!id) {
        throw new Error('Failed to get channel ID');
      }

      setChannelId(id);
      await loadMessages(id);
      setupRealtimeSubscription(id);
      
      setIsConnected(true);
      setIsReady(true);
      retryCountRef.current = 0;
      console.log('✅ Chat initialized successfully for channel:', channelName);

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      setIsConnected(false);
      setIsReady(false);
      
      if (retryCountRef.current < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, retryCountRef.current), 10000);
        retryCountRef.current++;
        setTimeout(initializeChat, delay);
      }
    } finally {
      setIsLoading(false);
      initializingRef.current = false;
    }
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !user?.id || !channelId) {
      console.warn('⚠️ Cannot send message: missing requirements', { content: !!content.trim(), userId: !!user?.id, channelId: !!channelId });
      return false;
    }

    try {
      console.log('📤 Handling message send:', content);
      
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
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

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

      console.log('✅ Message deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect function
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered for channel:', channelName);
    cleanupSubscription();
    retryCountRef.current = 0;
    initializeChat();
  }, [channelName, cleanupSubscription, initializeChat]);

  // Initialize when channel changes
  useEffect(() => {
    console.log('🔄 Channel changed, reinitializing:', channelName);
    cleanupSubscription();
    setMessages([]);
    setChannelId(null);
    setIsReady(false);
    retryCountRef.current = 0;
    initializingRef.current = false;
    
    if (channelName && user?.id) {
      initializeChat();
    }

    return () => {
      cleanupSubscription();
      initializingRef.current = false;
    };
  }, [channelName, user?.id, initializeChat, cleanupSubscription]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    deleteMessage,
    reconnect,
    isReady
  };
}
