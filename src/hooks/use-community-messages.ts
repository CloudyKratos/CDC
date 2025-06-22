
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useCommunityMessages(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const { user } = useAuth();

  // Get or create channel
  const initializeChannel = useCallback(async () => {
    if (!user?.id || !channelName) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // Check if channel exists
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Failed to find channel: ${channelError.message}`);
      }

      // Create channel if it doesn't exist
      if (!channel) {
        console.log('📝 Creating channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
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
      setError(null);
      setReconnectAttempts(0);
      console.log('✅ Channel initialized:', channel.id);
      
    } catch (err) {
      console.error('❌ Failed to initialize channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize channel');
      
      // Auto-retry with exponential backoff
      if (reconnectAttempts < 3) {
        const delay = Math.pow(2, reconnectAttempts) * 1000;
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          initializeChannel();
        }, delay);
      }
    }
  }, [user?.id, channelName, reconnectAttempts]);

  // Load existing messages
  const loadMessages = useCallback(async () => {
    if (!channelId || !user?.id) return;

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
        .limit(100); // Limit to last 100 messages for performance

      if (messagesError) {
        throw new Error(`Failed to load messages: ${messagesError.message}`);
      }

      const formattedMessages = messagesData?.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'User',
          full_name: 'Community Member',
          avatar_url: null
        }
      })) || [];

      setMessages(formattedMessages);
      console.log('✅ Loaded', formattedMessages.length, 'messages');
      setError(null);
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [channelId, user?.id]);

  // Set up real-time subscription with better error handling
  const setupRealtimeSubscription = useCallback(() => {
    if (!channelId || !user?.id) return;

    console.log('📡 Setting up real-time subscription for channel:', channelId);
    
    let retryTimeout: NodeJS.Timeout;
    
    const channel = supabase
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
              username: 'User',
              full_name: 'Community Member',
              avatar_url: null
            }
          };

          setMessages(prev => {
            // Check for duplicates
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
        
        if (status === 'SUBSCRIBED') {
          setError(null);
          setReconnectAttempts(0);
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setError('Real-time connection failed');
          setIsConnected(false);
          
          // Auto-reconnect after delay
          retryTimeout = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            setupRealtimeSubscription();
          }, 3000);
        }
      });

    return () => {
      console.log('🧹 Cleaning up subscription');
      if (retryTimeout) clearTimeout(retryTimeout);
      supabase.removeChannel(channel);
    };
  }, [channelId, user?.id]);

  // Send message function with retry logic
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !user?.id) {
      toast.error('Cannot send message - not connected');
      return false;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return false;
    }

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`📤 Sending message (attempt ${attempt + 1}):`, content.substring(0, 50));
        
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
          throw new Error(error.message);
        }

        // Add message to local state immediately for better UX
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', user.id)
          .single();

        const newMessage: Message = {
          id: data.id,
          content: data.content,
          created_at: data.created_at,
          sender_id: data.sender_id,
          sender: sender || {
            id: user.id,
            username: user.email?.split('@')[0] || 'You',
            full_name: user.email?.split('@')[0] || 'You',
            avatar_url: null
          }
        };

        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        console.log('✅ Message sent successfully');
        return true;

      } catch (err) {
        console.error(`❌ Send attempt ${attempt + 1} failed:`, err);
        attempt++;
        
        if (attempt < maxRetries) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          toast.error('Failed to send message after multiple attempts');
          return false;
        }
      }
    }

    return false;
  }, [channelId, user]);

  // Initialize everything
  useEffect(() => {
    if (user?.id) {
      initializeChannel();
    }
  }, [initializeChannel]);

  useEffect(() => {
    if (channelId) {
      loadMessages();
    }
  }, [channelId, loadMessages]);

  useEffect(() => {
    if (channelId && user?.id) {
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [channelId, user?.id, setupRealtimeSubscription]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  };
}
