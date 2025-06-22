import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Refs for cleanup and state management
  const subscriptionRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  // Enhanced channel initialization with better error handling
  const initializeChannel = useCallback(async () => {
    if (!user?.id || !channelName || isInitializingRef.current) {
      setIsLoading(false);
      return;
    }

    isInitializingRef.current = true;
    
    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // Clear any existing errors
      setError(null);
      
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
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} community channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
        toast.success(`Created #${channelName} channel`, { duration: 2000 });
      }

      setChannelId(channel.id);
      setError(null);
      setReconnectAttempts(0);
      console.log('✅ Channel initialized:', channel.id);
      
    } catch (err) {
      console.error('❌ Failed to initialize channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize channel';
      setError(errorMessage);
      
      // Auto-retry with exponential backoff (max 3 attempts)
      if (reconnectAttempts < 3) {
        const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 10000); // Max 10 seconds
        console.log(`🔄 Retrying in ${delay}ms (attempt ${reconnectAttempts + 1}/3)`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          isInitializingRef.current = false;
          initializeChannel();
        }, delay);
      }
    } finally {
      if (reconnectAttempts === 0) {
        isInitializingRef.current = false;
      }
    }
  }, [user?.id, channelName, reconnectAttempts]);

  // Enhanced message loading with better error handling
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
        .limit(50); // Load last 50 messages for better performance

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
          username: 'Unknown User',
          full_name: 'Community Member',
          avatar_url: null
        }
      })) || [];

      setMessages(formattedMessages);
      console.log('✅ Loaded', formattedMessages.length, 'messages');
      setError(null);
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, user?.id]);

  // Enhanced real-time subscription with automatic reconnection
  const setupRealtimeSubscription = useCallback(() => {
    if (!channelId || !user?.id) return;

    console.log('📡 Setting up real-time subscription for channel:', channelId);
    
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
    
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
          
          // Skip if message is from current user (to avoid duplicates)
          if (newMessage.sender_id === user.id) {
            return;
          }
          
          // Get sender profile with caching
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
              full_name: 'Community Member',
              avatar_url: null
            }
          };

          setMessages(prev => {
            // Check for duplicates
            const exists = prev.some(msg => msg.id === message.id);
            if (exists) return prev;
            
            // Add new message and keep only last 100 messages for performance
            const newMessages = [...prev, message];
            return newMessages.slice(-100);
          });
          
          // Show toast notification for new messages (not from current user)
          if (sender) {
            toast.success(`New message from ${sender.full_name || sender.username}`, {
              duration: 3000,
              icon: '💬',
            });
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
          console.log('✅ Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          setError('Real-time connection failed');
          setIsConnected(false);
          
          // Auto-reconnect after delay if not too many attempts
          if (reconnectAttempts < 5) {
            const delay = Math.min(3000 + (reconnectAttempts * 2000), 15000); // Max 15 seconds
            console.log(`🔄 Attempting to reconnect in ${delay}ms...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              setupRealtimeSubscription();
            }, delay);
          } else {
            toast.error('Connection lost. Please refresh the page.', { duration: 5000 });
          }
        }
      });

    subscriptionRef.current = channel;

    return () => {
      console.log('🧹 Cleaning up subscription and timers');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [channelId, user?.id, reconnectAttempts]);

  // Enhanced send message function with optimistic updates
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !user?.id) {
      toast.error('Cannot send message - not connected');
      return false;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return false;
    }

    // Optimistic update - add message immediately
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: user.email?.split('@')[0] || 'You',
        avatar_url: null
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);

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

        // Remove optimistic message and add real message
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
          
          // Check if real message already exists (from real-time)
          const exists = filtered.some(msg => msg.id === data.id);
          if (exists) return filtered;
          
          // Add real message
          const realMessage: Message = {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            sender_id: data.sender_id,
            sender: optimisticMessage.sender
          };
          
          return [...filtered, realMessage];
        });

        console.log('✅ Message sent successfully');
        return true;

      } catch (err) {
        console.error(`❌ Send attempt ${attempt + 1} failed:`, err);
        attempt++;
        
        if (attempt < maxRetries) {
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          // Remove optimistic message on final failure
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
          toast.error('Failed to send message after multiple attempts');
          return false;
        }
      }
    }

    return false;
  }, [channelId, user]);

  // Initialize everything with proper cleanup
  useEffect(() => {
    if (user?.id) {
      initializeChannel();
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  };
}
