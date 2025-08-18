import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface ReliableChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useReliableCommunityChat(channelName: string): ReliableChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const channelInitialized = useRef<string | null>(null);

  console.log('🚀 ReliableCommunityChat initialized for channel:', channelName);

  // Get or create channel
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
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`,
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
      }

      console.error('❌ Error getting channel:', error);
      return null;
      
    } catch (err) {
      console.error('❌ Error in getOrCreateChannel:', err);
      return null;
    }
  }, [user?.id]);

  // Load messages
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
        .limit(50);

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }

      const formattedMessages = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      console.log('✅ Loaded', formattedMessages.length, 'messages');
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
    }
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up realtime subscription for channel:', channelId);
    
    const subscription = supabase
      .channel(`reliable_community_${channelId}`)
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
          
          // Remove deleted messages
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          setError(null);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setError(`Connection ${status.toLowerCase()}`);
        }
      });

    subscriptionRef.current = subscription;
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      return true;
      
    } catch (err) {
      console.error('❌ Failed to send message:', err);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

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
      
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

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
      console.log('🚀 Initializing chat for channel:', targetChannelName);

      const channelResult = await getOrCreateChannel(targetChannelName);
      if (!channelResult) {
        throw new Error('Failed to get or create channel');
      }

      setChannelId(channelResult);
      channelInitialized.current = targetChannelName;

      await loadMessages(channelResult);
      setupRealtimeSubscription(channelResult);

      console.log('✅ Chat initialized successfully for channel:', targetChannelName);
      
    } catch (err) {
      console.error('❌ Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  // Initialize chat when channel changes
  useEffect(() => {
    if (channelName && channelName !== channelInitialized.current) {
      setMessages([]);
      setError(null);
      setIsConnected(false);
      channelInitialized.current = null;
      
      initializeChat(channelName);
    }
  }, [channelName, initializeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
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
    sendMessage,
    deleteMessage
  };
}