
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseSimpleChat {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useSimpleChat(channelName: string): UseSimpleChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Initialize channel and load messages
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No authenticated user, showing unauthenticated view');
      setIsLoading(false);
      setError(null);
      setIsConnected(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Initializing chat for channel:', channelName);
      
      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (channelError && channelError.code === 'PGRST116') {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating channel:', createError);
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        throw new Error(`Failed to access channel: ${channelError.message}`);
      }

      console.log('✅ Channel ready:', channel);
      setChannelId(channel.id);

      // Load existing messages
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
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Error loading messages:', messagesError);
        throw new Error(`Failed to load messages: ${messagesError.message}`);
      }

      console.log('✅ Messages loaded:', messagesData?.length || 0);

      const formattedMessages: Message[] = (messagesData || []).map(msg => ({
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
      setIsConnected(true);
      setError(null);
      
      // Set up realtime subscription
      console.log('🔄 Setting up realtime subscription');
      const subscription = supabase
        .channel(`community_messages_${channel.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_messages',
            filter: `channel_id=eq.${channel.id}`
          },
          async (payload) => {
            console.log('📨 New message received:', payload);
            const newMessage = payload.new as any;
            
            // Fetch sender details
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
              // Check if message already exists
              const exists = prev.some(m => m.id === message.id);
              if (exists) return prev;
              
              return [...prev, message].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'community_messages',
            filter: `channel_id=eq.${channel.id}`
          },
          (payload) => {
            console.log('📝 Message updated:', payload);
            const updatedMessage = payload.new as any;
            if (updatedMessage.is_deleted) {
              setMessages(prev => prev.filter(m => m.id !== updatedMessage.id));
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ Realtime connection established');
            setIsConnected(true);
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ Realtime connection error');
            setIsConnected(false);
          }
        });

      // Store subscription for cleanup
      return () => {
        console.log('🧹 Cleaning up realtime subscription');
        subscription.unsubscribe();
      };
      
    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
      setError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId || !content.trim()) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      console.log('📤 Sending message:', content);
      setError(null);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      toast.error('Failed to send message');
      throw error;
    }
  }, [user?.id, channelId]);
  
  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      console.log('🗑️ Deleting message:', messageId);
      setError(null);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Error deleting message:', error);
        throw error;
      }

      console.log('✅ Message deleted successfully');
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      setError(errorMessage);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  useEffect(() => {
    const cleanup = initializeChat();
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [initializeChat]);
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
