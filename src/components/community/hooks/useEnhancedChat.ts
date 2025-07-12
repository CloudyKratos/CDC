import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useEnhancedChat(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const { user } = useAuth();

  // Enhanced connection management
  const connectToChannel = useCallback(async () => {
    if (!user?.id || !channelName) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setConnectionAttempts(prev => prev + 1);

      console.log('🔄 Connecting to enhanced chat:', channelName);

      // Get or create channel with better error handling
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Channel lookup failed: ${channelError.message}`);
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

      setChannelId(channel.id);

      // Load existing messages
      const { data: existingMessages, error: messagesError } = await supabase
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
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.warn('⚠️ Could not load messages:', messagesError);
        setMessages([]);
      } else {
        const formattedMessages = (existingMessages || []).map(msg => ({
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
        setMessages(formattedMessages);
      }

      // Set up real-time subscription
      setupRealtimeSubscription(channel.id);
      
      setIsConnected(true);
      setIsLoading(false);
      
      console.log('✅ Enhanced chat connected successfully');

    } catch (err) {
      console.error('💥 Failed to connect to chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to chat');
      setIsConnected(false);
      setIsLoading(false);
      
      // Auto-retry after delay
      if (connectionAttempts < 3) {
        setTimeout(() => {
          connectToChannel();
        }, 2000 * connectionAttempts);
      }
    }
  }, [user?.id, channelName, connectionAttempts]);

  // Enhanced real-time subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    console.log('📡 Setting up enhanced real-time subscription');
    
    const subscription = supabase
      .channel(`enhanced_chat_${channelId}`)
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
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          // Auto-reconnect after delay
          setTimeout(() => {
            connectToChannel();
          }, 3000);
        }
      });

    return () => {
      console.log('🧹 Cleaning up subscription');
      supabase.removeChannel(subscription);
    };
  }, [connectToChannel]);

  // Enhanced send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId || !content.trim()) {
      toast.error("Cannot send message");
      return;
    }

    if (!isConnected) {
      toast.error("Not connected - message will be sent when connection is restored");
      return;
    }

    try {
      console.log('📤 Sending enhanced message');
      
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

      console.log('✅ Enhanced message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }, [user?.id, channelId, isConnected]);

  // Enhanced delete message function
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

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
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      throw error;
    }
  }, [user?.id]);

  // Initialize connection
  useEffect(() => {
    connectToChannel();
    
    return () => {
      console.log('🧹 Cleaning up enhanced chat');
    };
  }, [connectToChannel]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage,
    reconnect: connectToChannel,
    connectionAttempts
  };
}
