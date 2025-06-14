
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useSimpleChat(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string) => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting/creating channel:', name);
      
      // First try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError) {
        console.error('❌ Error checking for channel:', channelError);
        throw channelError;
      }

      if (!channel) {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', name);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: name,
            type: 'public',
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating channel:', createError);
          throw createError;
        }
        
        channel = newChannel;
      }

      console.log('✅ Channel ready:', channel.id);
      return channel.id;
    } catch (err) {
      console.error('💥 Error in getOrCreateChannel:', err);
      throw err;
    }
  }, [user?.id]);

  // Load messages for channel
  const loadMessages = useCallback(async (channelId: string) => {
    if (!user?.id || !channelId) return [];

    try {
      console.log('📖 Loading messages for channel:', channelId);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Error loading messages:', messagesError);
        return [];
      }

      if (!messagesData?.length) {
        console.log('📭 No messages found');
        return [];
      }

      // Get sender profiles
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      // Format messages with sender data
      const formattedMessages = messagesData.map(msg => {
        const senderProfile = profiles?.find(p => p.id === msg.sender_id);
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          sender: senderProfile ? {
            id: senderProfile.id,
            username: senderProfile.username || 'Unknown User',
            full_name: senderProfile.full_name || 'Unknown User',
            avatar_url: senderProfile.avatar_url
          } : {
            id: msg.sender_id,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          }
        };
      });

      console.log('✅ Messages loaded:', formattedMessages.length);
      return formattedMessages;
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      return [];
    }
  }, [user?.id]);

  // Set up realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (!channelId || !user?.id) return;

    console.log('🔄 Setting up realtime subscription for:', channelId);
    
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    const subscription = supabase
      .channel(`community_messages_${channelId}`)
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
            // Check if message already exists to avoid duplicates
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
          console.log('📝 Message updated:', payload);
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    subscriptionRef.current = subscription;
  }, [user?.id]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId || !content.trim()) {
      toast.error("Cannot send message");
      return;
    }

    try {
      console.log('📤 Sending message to channel:', channelId);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message');
        throw error;
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      throw error;
    }
  }, [user?.id, channelId]);

  // Delete message function
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
        console.error('❌ Error deleting message:', error);
        toast.error('Failed to delete message');
        throw error;
      }

      console.log('✅ Message deleted successfully');
      toast.success('Message deleted', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      throw error;
    }
  }, [user?.id]);

  // Initialize channel and load messages
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      if (!user?.id || !channelName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get or create channel
        const id = await getOrCreateChannel(channelName);
        if (!mounted) return;

        if (!id) {
          throw new Error('Failed to get/create channel');
        }

        setChannelId(id);

        // Load existing messages
        const existingMessages = await loadMessages(id);
        if (!mounted) return;

        setMessages(existingMessages);
        
        // Set up realtime subscription
        setupRealtimeSubscription(id);

        console.log('✅ Chat initialized with', existingMessages.length, 'messages');

      } catch (err) {
        console.error('💥 Failed to initialize chat:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage
  };
}
