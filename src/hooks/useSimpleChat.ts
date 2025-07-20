
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useSimpleChat(channelName: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const subscriptionRef = useRef<any>(null);
  const channelIdRef = useRef<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🎯 useSimpleChat hook called for channel:', channelName);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting or creating channel:', name);
      
      // First try to find existing channel
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!channel) {
        // Create new channel
        console.log('📝 Creating new channel:', name);
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
      } else {
        console.log('✅ Found existing channel:', channel.id);
      }

      return channel.id;
    } catch (error) {
      console.error('❌ Channel error:', error);
      setError('Failed to access channel');
      return null;
    }
  }, [user?.id]);

  // Load messages
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

      setMessages(formattedMessages);
      console.log('✅ Loaded messages:', formattedMessages.length);
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setError('Failed to load messages');
    }
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription for channel:', channelId);
    
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
          console.log('📨 New message received:', payload);
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

          setMessages(prev => {
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            return [...prev, message];
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          // Auto-reconnect after a delay
          reconnectTimeoutRef.current = setTimeout(() => {
            if (channelIdRef.current) {
              setupRealtimeSubscription(channelIdRef.current);
            }
          }, 3000);
        }
      });

    subscriptionRef.current = subscription;
  }, []);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName) {
      setIsLoading(false);
      return;
    }

    console.log('🚀 Initializing chat for channel:', channelName);
    setIsLoading(true);
    setError(null);

    try {
      const channelId = await getOrCreateChannel(channelName);
      if (!channelId) {
        setIsLoading(false);
        return;
      }

      channelIdRef.current = channelId;
      await loadMessages(channelId);
      setupRealtimeSubscription(channelId);
      
      console.log('✅ Chat initialized successfully for channel:', channelName);
    } catch (error) {
      console.error('❌ Failed to initialize chat:', error);
      setError('Failed to connect to chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelIdRef.current || !content.trim()) return false;

    console.log('📤 Handling message send:', content.substring(0, 50) + '...');

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id]);

  // Initialize on mount and when channel changes
  useEffect(() => {
    initializeChat();
    
    return () => {
      console.log('🧹 Cleaning up subscription on unmount');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [channelName, initializeChat]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage
  };
}
