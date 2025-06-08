
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseRealtimeChat {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useRealtimeChat(channelName: string): UseRealtimeChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Get or create channel
  const initializeChannel = useCallback(async () => {
    if (!user?.id) return null;

    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // First try to get existing channel
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
          throw createError;
        }
        
        channel = newChannel;
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        throw channelError;
      }

      console.log('✅ Channel ready:', channel);
      setChannelId(channel.id);
      
      // Auto-join the user to the channel
      const { error: joinError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id
        });

      // Ignore unique constraint violations (user already in channel)
      if (joinError && !joinError.message.includes('duplicate key')) {
        console.error('❌ Error joining channel:', joinError);
      }

      return channel.id;
    } catch (error) {
      console.error('💥 Failed to initialize channel:', error);
      throw error;
    }
  }, [channelName, user?.id]);

  // Load messages
  const loadMessages = useCallback(async (channelId: string) => {
    try {
      console.log('🔄 Loading messages for channel:', channelId);
      
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
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }

      console.log('✅ Loaded messages:', messages?.length || 0);

      const formattedMessages: Message[] = (messages || []).map(msg => ({
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
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      throw error;
    }
  }, []);

  // Set up realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    console.log('🔄 Setting up realtime subscription for channel:', channelId);
    
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
          event: 'DELETE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          console.log('🗑️ Message deleted:', payload);
          const deletedMessage = payload.old as any;
          setMessages(prev => prev.filter(m => m.id !== deletedMessage.id));
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connection established');
          toast.success('Connected to real-time chat');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Realtime connection error');
          setError('Real-time connection failed');
          toast.error('Real-time connection failed');
        }
      });

    return subscription;
  }, []);

  // Initialize chat
  useEffect(() => {
    let subscription: any = null;
    
    const initializeChat = async () => {
      if (!user?.id) {
        setIsLoading(false);
        setError('Please log in to access chat');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const channelId = await initializeChannel();
        if (!channelId) return;

        await loadMessages(channelId);
        subscription = setupRealtimeSubscription(channelId);
      } catch (error) {
        console.error('💥 Chat initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize chat';
        setError(errorMessage);
        toast.error('Failed to load chat: ' + errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
    
    return () => {
      if (subscription) {
        console.log('🧹 Cleaning up subscription');
        subscription.unsubscribe();
      }
    };
  }, [user?.id, channelName, initializeChannel, loadMessages, setupRealtimeSubscription]);

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
      toast.error('Failed to send message: ' + errorMessage);
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
        .eq('sender_id', user.id); // Ensure user can only delete their own messages

      if (error) {
        console.error('❌ Error deleting message:', error);
        throw error;
      }

      console.log('✅ Message deleted successfully');
      // Remove from local state immediately for better UX
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      setError(errorMessage);
      toast.error('Failed to delete message: ' + errorMessage);
    }
  }, [user?.id]);
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
