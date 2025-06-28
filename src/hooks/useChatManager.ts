
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useChannelInitialization } from './use-channel-initialization';

export function useChatManager(channelName: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const { user } = useAuth();
  const { initializeChannel, isInitializing, error: initError } = useChannelInitialization();
  const subscriptionRef = useRef<any>(null);

  // Initialize channel and load messages
  const setupChat = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const channelId = await initializeChannel(channelName);
      
      if (!channelId) {
        console.error('Failed to initialize channel');
        return;
      }

      setChannelId(channelId);

      // Load existing messages
      const { data: messages, error: messagesError } = await supabase
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
      } else {
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
        setMessages(formattedMessages);
      }

      // Setup real-time subscription
      setupRealtimeSubscription(channelId);

    } catch (error) {
      console.error('💥 Failed to setup chat:', error);
      toast.error('Failed to connect to chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName, initializeChannel]);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up real-time subscription for channel:', channelId);
    
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
            setupChat();
          }, 3000);
        }
      });

    subscriptionRef.current = subscription;
  }, [setupChat]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId || !content.trim() || isSending) {
      return;
    }

    setIsSending(true);
    try {
      console.log('📤 Sending message');
      
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
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [user?.id, channelId, isSending]);

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
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      toast.success('Message deleted', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Reply to message (placeholder implementation)
  const replyToMessage = useCallback((messageId: string) => {
    console.log('Replying to message:', messageId);
    // This would be implemented to set up a reply context
    toast.info('Reply feature coming soon!');
  }, []);

  // Add reaction (placeholder implementation)
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    console.log('Adding reaction:', reaction, 'to message:', messageId);
    // This would be implemented to add reactions to messages
    toast.info('Reactions feature coming soon!');
  }, []);

  // Initialize on mount
  useEffect(() => {
    setupChat();
    
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription');
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [setupChat]);

  return {
    messages,
    isLoading: isLoading || isInitializing,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction,
    isSending,
    error: initError,
    reconnect: setupChat
  };
}
