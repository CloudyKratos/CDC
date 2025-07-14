
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface UseSimpleCommunityChat {
  messages: Message[];
  users: User[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  startTyping: () => void;
  reconnect: () => void;
  isReady: boolean;
}

export function useSimpleCommunityChat(channelName: string): UseSimpleCommunityChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const initializingRef = useRef(false);

  // Clear any existing subscriptions
  const cleanupSubscriptions = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  }, []);

  // Initialize chat with absolute minimal approach
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No user available');
      setIsLoading(false);
      setError(null); // Don't show error when no user
      return;
    }

    if (initializingRef.current) {
      console.log('⏳ Already initializing, skipping...');
      return;
    }

    initializingRef.current = true;
    
    try {
      setIsLoading(true);
      setError(null);
      setIsConnected(false);
      
      console.log('🚀 Starting ultra-simple chat initialization for:', channelName);

      // Step 1: Ensure user profile exists (CRITICAL for messaging)
      console.log('📝 Checking/creating user profile...');
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileCheckError) {
        console.error('❌ Profile check failed:', profileCheckError);
        throw new Error(`Profile check failed: ${profileCheckError.message}`);
      }

      if (!existingProfile) {
        console.log('📝 Creating new user profile...');
        const { error: profileCreateError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            email: user.email
          });

        if (profileCreateError) {
          console.error('❌ Profile creation failed:', profileCreateError);
          throw new Error(`Profile creation failed: ${profileCreateError.message}`);
        }
        console.log('✅ User profile created');
      } else {
        console.log('✅ User profile exists');
      }

      // Step 2: Get or create channel (ULTRA SIMPLE)
      console.log('🔍 Getting/creating channel:', channelName);
      
      // First try to get existing channel
      const { data: existingChannel, error: channelGetError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelGetError) {
        console.error('❌ Channel get failed:', channelGetError);
        throw new Error(`Channel lookup failed: ${channelGetError.message}`);
      }

      let finalChannelId: string;

      if (existingChannel) {
        finalChannelId = existingChannel.id;
        console.log('✅ Found existing channel:', finalChannelId);
      } else {
        console.log('📝 Creating new channel...');
        const { data: newChannel, error: channelCreateError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (channelCreateError) {
          console.error('❌ Channel creation failed:', channelCreateError);
          throw new Error(`Channel creation failed: ${channelCreateError.message}`);
        }
        
        finalChannelId = newChannel.id;
        console.log('✅ Created new channel:', finalChannelId);
      }

      setChannelId(finalChannelId);

      // Step 3: Load existing messages (SIMPLE)
      console.log('📥 Loading messages...');
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
        .eq('channel_id', finalChannelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.error('❌ Messages load failed:', messagesError);
        // Don't throw error, just log and continue with empty messages
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
        console.log(`✅ Loaded ${formattedMessages.length} messages`);
      }

      // Step 4: Setup realtime (ULTRA SIMPLE)
      setupRealtimeSubscription(finalChannelId);
      
      setIsConnected(true);
      setIsReady(true);
      setIsLoading(false);
      
      console.log('🎉 Chat initialization complete!');

    } catch (err) {
      console.error('💥 Chat initialization failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setError(errorMessage);
      setIsConnected(false);
      setIsReady(false);
      setIsLoading(false);
      toast.error(`Chat initialization failed: ${errorMessage}`);
    } finally {
      initializingRef.current = false;
    }
  }, [user?.id, channelName]);

  // Setup realtime subscription (ULTRA SIMPLE)
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    cleanupSubscriptions();

    console.log('📡 Setting up realtime for channel:', channelId);
    
    const channel = supabase
      .channel(`simple_chat_${channelId}`)
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
        if (status === 'SUBSCRIBED') {
          setError(null);
        }
      });

    subscriptionRef.current = channel;
  }, [cleanupSubscriptions]);

  // Send message (ULTRA SIMPLE)
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) {
      console.error('❌ Cannot send message - missing requirements');
      if (!user?.id) toast.error("Please sign in to send messages");
      if (!channelId) toast.error("No channel available");
      return false;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50) + '...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Send message error:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
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

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      toast.success("Message deleted", { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Start typing (placeholder)
  const startTyping = useCallback(() => {
    // Simple typing indicator - no complex logic for now
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setError(null);
    setIsLoading(true);
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount
  useEffect(() => {
    console.log('🔧 useSimpleCommunityChat mounting for channel:', channelName);
    initializeChat();
    
    return () => {
      console.log('🧹 useSimpleCommunityChat cleanup');
      cleanupSubscriptions();
      initializingRef.current = false;
    };
  }, [initializeChat, cleanupSubscriptions, channelName]);

  return {
    messages,
    users,
    isConnected,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    startTyping,
    reconnect,
    isReady
  };
}
