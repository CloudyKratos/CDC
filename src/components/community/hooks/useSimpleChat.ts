
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseSimpleChatResult {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useSimpleChat(channelName: string): UseSimpleChatResult {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      console.error('❌ User not authenticated');
      return null;
    }

    try {
      console.log('🔍 Getting or creating channel:', channelName);
      
      // First, try to get existing channel
      let { data: channel, error: fetchError } = await supabase
        .from('channels')
        .select('id, name, type, created_at')
        .eq('name', channelName)
        .eq('type', 'public')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching channel:', fetchError);
        throw new Error(`Failed to fetch channel: ${fetchError.message}`);
      }

      if (channel) {
        console.log('✅ Found existing channel:', channel.id);
        return channel.id;
      }

      // Create new channel if it doesn't exist
      console.log('📝 Creating new channel:', channelName);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} discussion`,
          created_by: user.id
        })
        .select('id, name, type, created_at')
        .single();

      if (createError) {
        console.error('❌ Error creating channel:', createError);
        throw new Error(`Failed to create channel: ${createError.message}`);
      }
      
      console.log('✅ Created new channel:', newChannel.id);
      return newChannel.id;
      
    } catch (err) {
      console.error('❌ Failed to get/create channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    }
  }, [user?.id]);

  // Load messages for channel
  const loadMessages = useCallback(async (channelId: string) => {
    if (!channelId) {
      console.log('⚠️ No channel ID provided for loading messages');
      return;
    }

    try {
      setIsLoading(true);
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messages, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (
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

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw new Error(`Failed to load messages: ${error.message}`);
      }

      const formattedMessages: Message[] = (messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: msg.profiles ? {
          id: msg.profiles.id,
          username: msg.profiles.username || 'Unknown User',
          full_name: msg.profiles.full_name || 'Unknown User',
          avatar_url: msg.profiles.avatar_url
        } : {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      console.log('✅ Loaded messages:', formattedMessages.length);
      
    } catch (error) {
      console.error('💥 Exception loading messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMessage);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup realtime subscription
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    if (!channelId) {
      console.log('⚠️ No channel ID for realtime subscription');
      return;
    }

    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription for channel:', channelId);

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
          console.log('📨 New message received via realtime:', payload);
          const newMessage = payload.new as any;
          
          // Fetch sender details
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const formattedMessage: Message = {
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
            // Avoid duplicate messages
            if (prev.some(msg => msg.id === formattedMessage.id)) {
              return prev;
            }
            return [...prev, formattedMessage];
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
        
        if (status === 'SUBSCRIBED') {
          setError(null);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setError('Connection lost, attempting to reconnect...');
        }
      });

    subscriptionRef.current = subscription;
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) {
      console.log('⚠️ Cannot send message: missing user, channel, or content');
      return false;
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
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      return true;
      
    } catch (error) {
      console.error('💥 Exception sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setError(errorMessage);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) {
      console.log('⚠️ Cannot delete message: user not authenticated');
      return;
    }

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      toast.success('Message deleted');
      
    } catch (error) {
      console.error('💥 Exception deleting message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      setError(errorMessage);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Initialize chat when channel name or user changes
  useEffect(() => {
    const initializeChat = async () => {
      if (!user?.id || !channelName) {
        console.log('⚠️ Cannot initialize chat: missing user or channel name');
        return;
      }

      setError(null);
      setMessages([]);
      setIsConnected(false);

      // Get or create channel
      const newChannelId = await getOrCreateChannel(channelName);
      if (!newChannelId) {
        console.error('❌ Failed to initialize channel');
        return;
      }

      setChannelId(newChannelId);
      
      // Load messages and setup realtime
      await loadMessages(newChannelId);
      setupRealtimeSubscription(newChannelId);
    };

    initializeChat();

    // Cleanup on unmount or when dependencies change
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [channelName, user?.id, getOrCreateChannel, loadMessages, setupRealtimeSubscription]);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
