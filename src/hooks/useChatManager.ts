
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useChannelInitialization } from './use-channel-initialization';
import { useRealtimeSubscription } from './use-realtime-subscription';
import { useMessageActions } from './use-message-actions';

export function useChatManager(channelName: string = 'general') {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  
  const { user } = useAuth();
  const { 
    initializeChannel, 
    isInitializing, 
    error: initError, 
    channelId 
  } = useChannelInitialization();
  
  const { 
    isConnected, 
    setupRealtimeSubscription, 
    cleanup: cleanupSubscription 
  } = useRealtimeSubscription();
  
  const { 
    sendMessage: sendMessageAction, 
    deleteMessage: deleteMessageAction,
    replyToMessage,
    addReaction
  } = useMessageActions();

  // Initialize channel and load messages
  const setupChat = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Setting up chat for channel:', channelName);
      
      const initChannelId = await initializeChannel(channelName);
      
      if (!initChannelId) {
        console.error('Failed to initialize channel');
        return;
      }

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
        .eq('channel_id', initChannelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.warn('⚠️ Could not load messages:', messagesError);
        setMessages([]);
      } else {
        const formattedMessages = (messagesData || []).map(msg => ({
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
      }

      // Setup real-time subscription
      setupRealtimeSubscription(initChannelId, setMessages);

    } catch (error) {
      console.error('💥 Failed to setup chat:', error);
      toast.error('Failed to connect to chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName, initializeChannel, setupRealtimeSubscription]);

  // Send message wrapper
  const sendMessage = useCallback(async (content: string) => {
    if (!channelId || isSending) return;

    setIsSending(true);
    try {
      await sendMessageAction(content, channelId);
    } finally {
      setIsSending(false);
    }
  }, [channelId, isSending, sendMessageAction]);

  // Delete message wrapper
  const deleteMessage = useCallback(async (messageId: string) => {
    await deleteMessageAction(messageId);
  }, [deleteMessageAction]);

  // Initialize on mount
  useEffect(() => {
    setupChat();
    
    return () => {
      cleanupSubscription();
    };
  }, [setupChat, cleanupSubscription]);

  return {
    messages,
    isLoading: isLoading || isInitializing,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction,
    isSending,
    error: initError,
    reconnect: setupChat
  };
}
