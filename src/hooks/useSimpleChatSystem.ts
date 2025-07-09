
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSimpleAuth } from '@/contexts/SimpleAuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SimpleChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  isReady: boolean;
  isSending: boolean;
}

export function useSimpleChatSystem(channelName: string = 'general') {
  const { user } = useSimpleAuth();
  const [state, setState] = useState<SimpleChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    error: null,
    isReady: false,
    isSending: false
  });

  const subscriptionRef = useRef<any>(null);

  // Load messages with better error handling
  const loadMessages = useCallback(async () => {
    if (!user?.id) {
      setState(prev => ({ ...prev, isLoading: false, isReady: false }));
      return;
    }

    try {
      console.log('📥 Loading messages for', channelName, 'channel...');
      
      // Try to load messages directly without complex joins first
      const { data: messages, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('channel_id', 'general-channel')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('❌ Messages load error:', error);
        // Don't throw error, just set empty messages and continue
        setState(prev => ({ 
          ...prev, 
          messages: [],
          error: null,
          isLoading: false
        }));
        return;
      }

      // Get sender profiles separately to avoid foreign key issues
      const senderIds = [...new Set((messages || []).map(msg => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      const profileMap = new Map(
        (profiles || []).map(profile => [profile.id, profile])
      );

      const formattedMessages: Message[] = (messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: profileMap.get(msg.sender_id) || {
          id: msg.sender_id,
          username: 'User',
          full_name: 'User',
          avatar_url: null
        }
      }));

      setState(prev => ({ 
        ...prev, 
        messages: formattedMessages,
        error: null,
        isLoading: false
      }));
      
      console.log('✅ Messages loaded successfully:', formattedMessages.length);

    } catch (error) {
      console.error('💥 Load messages failed:', error);
      setState(prev => ({ 
        ...prev, 
        messages: [],
        error: null, // Don't show error to user, just continue
        isLoading: false
      }));
    }
  }, [user?.id, channelName]);

  // Ensure user profile exists
  const ensureUserProfile = useCallback(async () => {
    if (!user?.id) return false;

    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile) {
        // Create profile
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'User',
            username: user.email?.split('@')[0] || 'user',
            email: user.email
          });

        if (createError) {
          console.error('Profile creation error:', createError);
          return false;
        }
        console.log('✅ User profile created');
      }

      return true;
    } catch (error) {
      console.error('Profile setup failed:', error);
      return false;
    }
  }, [user]);

  // Send message with simplified approach
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !content.trim() || state.isSending) {
      return false;
    }

    setState(prev => ({ ...prev, isSending: true }));

    try {
      console.log('📤 Sending message...');
      
      // Ensure profile exists first
      const profileReady = await ensureUserProfile();
      if (!profileReady) {
        throw new Error('Profile setup failed');
      }

      // Send message directly to general-channel
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: 'general-channel',
          sender_id: user.id,
          content: content.trim()
        })
        .select('id, content, created_at, sender_id')
        .single();

      if (error) {
        console.error('❌ Send message error:', error);
        throw new Error('Failed to send message');
      }

      console.log('✅ Message sent successfully');
      setState(prev => ({ ...prev, isSending: false }));
      return true;

    } catch (error) {
      console.error('💥 Send message failed:', error);
      setState(prev => ({ ...prev, isSending: false }));
      toast.error('Failed to send message. Please try again.');
      return false;
    }
  }, [user?.id, state.isSending, ensureUserProfile]);

  // Setup realtime subscription
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
              full_name: 'User',
              avatar_url: null
            }
          };

          setState(prev => {
            // Avoid duplicates
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
          isConnected: status === 'SUBSCRIBED'
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
        isReady: false 
      }));
      return;
    }

    try {
      console.log('🚀 Initializing simple chat system...');
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load messages
      await loadMessages();

      // Setup realtime
      setupRealtime();

      setState(prev => ({
        ...prev,
        isReady: true,
        error: null
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
        console.error('Delete error:', error);
        return false;
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg.id !== messageId)
      }));

      return true;
    } catch (error) {
      console.error('Delete failed:', error);
      return false;
    }
  }, [user?.id]);

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
    reload: initializeChat
  };
}
