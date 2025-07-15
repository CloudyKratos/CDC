
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMemoryManager } from './useMemoryManager';
import { useConnectionHealth } from './useConnectionHealth';
import { useMessageDeduplication } from './useMessageDeduplication';
import type { Message } from '@/types/chat';

interface StableChatConnection {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  messages: Message[];
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  reconnect: () => void;
}

export function useStableChatConnection(channelName: string): StableChatConnection {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const channelIdRef = useRef<string | null>(null);
  const subscriptionRef = useRef<any>(null);
  const initializingRef = useRef(false);
  
  const memoryManager = useMemoryManager();
  const { health, handleConnectionStatus, scheduleReconnect, resetReconnectAttempts } = useConnectionHealth();
  const { isDuplicate, markProcessing, markSent, markFailed, deduplicateMessages } = useMessageDeduplication();

  const cleanupSubscription = useCallback(() => {
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up chat subscription');
      memoryManager.unregisterSubscription('chat_subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }
  }, [memoryManager]);

  const initializeConnection = useCallback(async () => {
    if (initializingRef.current || memoryManager.isUnmounted()) {
      return;
    }

    initializingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('🚀 Initializing stable chat connection for:', channelName);

      // Get user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw channelError;
      }

      if (!channel) {
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

        if (createError) throw createError;
        channel = newChannel;
      }

      channelIdRef.current = channel.id;

      // Load existing messages
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
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.error('❌ Messages load error:', messagesError);
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

        const dedupedMessages = deduplicateMessages(formattedMessages);
        setMessages(dedupedMessages);
      }

      // Setup realtime subscription with error handling
      setupRealtimeSubscription(channel.id);
      
      setIsLoading(false);
      resetReconnectAttempts();
      console.log('✅ Stable chat connection established');

    } catch (err) {
      console.error('💥 Failed to initialize chat connection:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setError(errorMessage);
      setIsLoading(false);
      
      // Schedule reconnect on failure
      scheduleReconnect(() => {
        initializeConnection();
      });
    } finally {
      initializingRef.current = false;
    }
  }, [channelName, memoryManager, resetReconnectAttempts, scheduleReconnect, deduplicateMessages]);

  const setupRealtimeSubscription = useCallback((channelId: string) => {
    cleanupSubscription();

    console.log('📡 Setting up stable realtime subscription');
    
    const subscription = supabase
      .channel(`stable_chat_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          if (memoryManager.isUnmounted()) return;
          
          console.log('📨 New message received');
          const newMessage = payload.new as any;
          
          // Create message object
          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id,
            sender: {
              id: newMessage.sender_id,
              username: 'Loading...',
              full_name: 'Loading...',
              avatar_url: null
            }
          };

          // Check for duplicates
          if (isDuplicate(message)) {
            console.log('🔄 Duplicate message ignored:', message.id);
            return;
          }

          // Get sender profile asynchronously
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const finalMessage = {
            ...message,
            sender: sender || message.sender
          };

          setMessages(prev => {
            const updated = [...prev, finalMessage];
            return deduplicateMessages(updated);
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
          if (memoryManager.isUnmounted()) return;
          
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        handleConnectionStatus(status, health.reconnectAttempts);
        
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          scheduleReconnect(() => {
            if (channelIdRef.current) {
              setupRealtimeSubscription(channelIdRef.current);
            }
          });
        }
      });

    subscriptionRef.current = subscription;
    memoryManager.registerSubscription('chat_subscription', subscription);
  }, [cleanupSubscription, memoryManager, isDuplicate, deduplicateMessages, handleConnectionStatus, health.reconnectAttempts, scheduleReconnect]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelIdRef.current || !content.trim()) return false;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const tempId = `temp_${Date.now()}`;
    markProcessing(tempId);

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelIdRef.current,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) throw error;
      
      markSent(tempId);
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      markFailed(tempId);
      return false;
    }
  }, [markProcessing, markSent, markFailed]);

  const deleteMessage = useCallback(async (messageId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Failed to delete message:', error);
    }
  }, []);

  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    cleanupSubscription();
    initializeConnection();
  }, [cleanupSubscription, initializeConnection]);

  // Initialize on mount
  useEffect(() => {
    initializeConnection();
    
    return () => {
      cleanupSubscription();
    };
  }, [initializeConnection, cleanupSubscription]);

  return {
    isConnected: health.status === 'connected',
    isLoading,
    error,
    messages,
    sendMessage,
    deleteMessage,
    reconnect
  };
}
