
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  isReady: boolean;
  isSending: boolean;
}

export function useReliableChatSystem(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    isReady: false,
    isSending: false
  });

  const subscriptionRef = useRef<any>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Ensure user profile exists
  const ensureUserProfile = useCallback(async () => {
    if (!user?.id) return false;

    try {
      console.log('🔍 Checking user profile...');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('❌ Profile check error:', error);
        return false;
      }

      if (!profile) {
        console.log('📝 Creating user profile...');
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            username: user.email?.split('@')[0] || 'user',
            email: user.email
          });

        if (createError) {
          console.error('❌ Profile creation failed:', createError);
          return false;
        }
        console.log('✅ User profile created');
      }

      return true;
    } catch (error) {
      console.error('💥 Profile setup failed:', error);
      return false;
    }
  }, [user]);

  // Load messages with retry logic
  const loadMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('📥 Loading messages...');
      
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
        .eq('channel_id', 'general-channel')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) {
        console.error('❌ Messages load error:', error);
        setState(prev => ({ ...prev, error: 'Failed to load messages' }));
        return;
      }

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

      setState(prev => ({ 
        ...prev, 
        messages: formattedMessages,
        error: null 
      }));
      
      console.log(`✅ Loaded ${formattedMessages.length} messages`);
      retryCount.current = 0; // Reset retry count on success

    } catch (error) {
      console.error('💥 Load messages failed:', error);
      setState(prev => ({ ...prev, error: 'Connection error' }));
    }
  }, [user?.id]);

  // Setup realtime with better error handling
  const setupRealtime = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription...');

    const channel = supabase
      .channel('general-chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: 'channel_id=eq.general-channel'
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;

          try {
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

            setState(prev => {
              const exists = prev.messages.some(msg => msg.id === message.id);
              if (exists) return prev;
              return {
                ...prev,
                messages: [...prev.messages, message]
              };
            });
          } catch (error) {
            console.error('❌ Error processing new message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : prev.error
        }));
      });

    subscriptionRef.current = channel;
  }, []);

  // Initialize chat system
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        isReady: false,
        error: null 
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('🚀 Initializing reliable chat system...');

      // Step 1: Ensure user profile exists
      const profileReady = await ensureUserProfile();
      if (!profileReady) {
        throw new Error('Failed to setup user profile');
      }

      // Step 2: Load messages
      await loadMessages();

      // Step 3: Setup realtime
      setupRealtime();

      setState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true,
        error: null
      }));

      console.log('✅ Reliable chat system initialized');

    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize chat',
        isLoading: false,
        isReady: false
      }));
    }
  }, [user?.id, ensureUserProfile, loadMessages, setupRealtime]);

  // Send message with comprehensive error handling
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !content.trim() || state.isSending) {
      console.log('❌ Cannot send message - requirements not met');
      return false;
    }

    setState(prev => ({ ...prev, isSending: true }));

    try {
      console.log('📤 Sending message:', content);
      
      // Ensure profile exists before sending
      const profileReady = await ensureUserProfile();
      if (!profileReady) {
        throw new Error('Profile setup failed');
      }

      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: 'general-channel',
          sender_id: user.id,
          content: content.trim()
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ Send message error:', error);
        throw new Error(`Send failed: ${error.message}`);
      }

      console.log('✅ Message sent successfully:', data);
      setState(prev => ({ ...prev, isSending: false }));
      return true;

    } catch (error) {
      console.error('💥 Send message failed:', error);
      setState(prev => ({ ...prev, isSending: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(errorMessage);
      
      return false;
    }
  }, [user?.id, state.isSending, ensureUserProfile]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete error:', error);
        toast.error('Failed to delete message');
        return false;
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId)
      }));

      console.log('✅ Message deleted');
      return true;
    } catch (error) {
      console.error('💥 Delete failed:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect with exponential backoff
  const reconnect = useCallback(() => {
    if (retryCount.current >= maxRetries) {
      console.log('❌ Max retries reached');
      setState(prev => ({ 
        ...prev, 
        error: 'Connection failed after multiple attempts. Please refresh the page.' 
      }));
      return;
    }

    retryCount.current++;
    console.log(`🔄 Reconnecting... (attempt ${retryCount.current}/${maxRetries})`);
    
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    
    // Exponential backoff
    const delay = Math.pow(2, retryCount.current) * 1000;
    setTimeout(() => {
      initializeChat();
    }, delay);
  }, [initializeChat]);

  // Initialize on mount and user change
  useEffect(() => {
    initializeChat();

    return () => {
      console.log('🧹 Chat cleanup');
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
    };
  }, [initializeChat]);

  return {
    ...state,
    sendMessage,
    deleteMessage,
    reconnect
  };
}
