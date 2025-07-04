
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
}

export function useSimpleChatSystem(channelName: string = 'general') {
  const { user } = useAuth();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    isReady: false
  });

  const subscriptionRef = useRef<any>(null);
  const channelIdRef = useRef<string>('general-channel');

  // Load messages with minimal database calls
  const loadMessages = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, messages: [] }));
      return;
    }

    try {
      console.log('📥 Loading messages for general channel...');
      
      // Direct query to messages table
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
        .eq('channel_id', channelIdRef.current)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('❌ Messages load error:', error);
        setState(prev => ({ ...prev, messages: [], error: error.message }));
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

      setState(prev => ({ ...prev, messages: formattedMessages }));
      console.log(`✅ Loaded ${formattedMessages.length} messages`);

    } catch (error) {
      console.error('💥 Load messages failed:', error);
      setState(prev => ({ ...prev, messages: [], error: 'Failed to load messages' }));
    }
  }, [user?.id]);

  // Setup realtime subscription
  const setupRealtime = useCallback(() => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up realtime subscription...');

    const channel = supabase
      .channel(`chat_${channelIdRef.current}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelIdRef.current}`
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

          setState(prev => {
            const exists = prev.messages.some(msg => msg.id === message.id);
            if (exists) return prev;
            return {
              ...prev,
              messages: [...prev.messages, message]
            };
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setState(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          error: status === 'SUBSCRIBED' ? null : 'Connection lost'
        }));
      });

    subscriptionRef.current = channel;
  }, []);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, error: null }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('🚀 Initializing simple chat system...');

      // First ensure user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            email: user.email
          });

        if (createError) {
          console.error('❌ Profile creation failed:', createError);
        } else {
          console.log('✅ User profile created');
        }
      }

      // Load messages and setup realtime
      await loadMessages();
      setupRealtime();

      setState(prev => ({
        ...prev,
        isLoading: false,
        isReady: true
      }));

      console.log('✅ Simple chat system initialized');

    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize chat',
        isLoading: false,
        isReady: false
      }));
    }
  }, [user?.id, loadMessages, setupRealtime]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !content.trim()) {
      console.error('❌ Cannot send message - missing requirements');
      return false;
    }

    try {
      console.log('📤 Sending message...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Send message error:', error);
        toast.error('Failed to send message');
        return false;
      }

      console.log('✅ Message sent');
      return true;
    } catch (error) {
      console.error('💥 Send message failed:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id]);

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

      console.log('✅ Message deleted');
      return true;
    } catch (error) {
      console.error('💥 Delete failed:', error);
      toast.error('Failed to delete message');
      return false;
    }
  }, [user?.id]);

  // Reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Reconnecting...');
    setState(prev => ({ ...prev, error: null, isLoading: true }));
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount
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
