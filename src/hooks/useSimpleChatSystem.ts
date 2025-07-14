
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useSimpleChatSystem(channelName: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  // Get or create channel by name
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Looking for channel:', name);
      
      // First try to find existing channel
      const { data: existingChannel, error: findError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (findError && findError.code !== 'PGRST116') {
        console.error('❌ Error finding channel:', findError);
        throw findError;
      }

      if (existingChannel) {
        console.log('✅ Found existing channel:', existingChannel.id);
        return existingChannel.id;
      }

      // Create new channel if it doesn't exist
      console.log('📝 Creating new channel:', name);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name,
          type: 'public',
          created_by: user.id,
          description: `${name} community chat`
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating channel:', createError);
        throw createError;
      }

      console.log('✅ Created new channel:', newChannel.id);
      return newChannel.id;
    } catch (error) {
      console.error('💥 Channel resolution failed:', error);
      return null;
    }
  }, [user?.id]);

  // Load messages for the channel
  const loadMessages = useCallback(async (channelUuid: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelUuid);
      
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
        .eq('channel_id', channelUuid)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Messages load error:', error);
        throw error;
      }

      console.log('✅ Messages loaded:', messages?.length || 0);

      const formattedMessages: Message[] = (messages || []).map(msg => ({
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
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      setError('Failed to load messages');
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !user?.id || !content.trim()) {
      console.error('❌ Cannot send message: missing requirements');
      return false;
    }

    setIsSending(true);
    try {
      console.log('📤 Sending message to channel:', channelId);
      
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
          is_deleted: false
        })
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .single();

      if (error) {
        console.error('❌ Send message error:', error);
        throw error;
      }

      console.log('✅ Message sent successfully:', data.id);
      return true;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [channelId, user?.id]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete message error:', error);
        throw error;
      }

      console.log('✅ Message deleted successfully');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelUuid: string) => {
    if (subscriptionRef.current) {
      console.log('🔌 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription...');
    
    const subscription = supabase
      .channel(`community_messages:${channelUuid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelUuid}`
        },
        async (payload) => {
          console.log('📨 New message received:', payload.new);
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            created_at: payload.new.created_at,
            sender_id: payload.new.sender_id,
            sender: profile || {
              id: payload.new.sender_id,
              username: 'Unknown',
              full_name: 'Unknown User',
              avatar_url: null
            }
          };

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelUuid}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload.new);
          
          if (payload.new.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== payload.new.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
    return subscription;
  }, []);

  // Initialize chat system
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      console.log('⏳ Waiting for user authentication...');
      return;
    }

    console.log('🚀 Initializing simple chat system...');
    setIsLoading(true);
    setError(null);

    try {
      // Get or create channel
      const resolvedChannelId = await getOrCreateChannel(channelName);
      if (!resolvedChannelId) {
        throw new Error('Failed to resolve channel');
      }

      setChannelId(resolvedChannelId);

      // Load messages
      console.log('📥 Loading messages for', channelName, 'channel...');
      await loadMessages(resolvedChannelId);

      // Setup realtime subscription
      console.log('📡 Setting up realtime subscription...');
      setupRealtimeSubscription(resolvedChannelId);

      setIsReady(true);
      console.log('✅ Simple chat system initialized');
    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setError('Failed to initialize chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  // Reload function
  const reload = useCallback(() => {
    console.log('🔄 Reloading chat system...');
    setIsReady(false);
    setChannelId(null);
    setMessages([]);
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount and when dependencies change
  useEffect(() => {
    initializeChat();

    return () => {
      if (subscriptionRef.current) {
        console.log('🔌 Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [initializeChat]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    isReady,
    isSending,
    sendMessage,
    deleteMessage,
    reload
  };
}
