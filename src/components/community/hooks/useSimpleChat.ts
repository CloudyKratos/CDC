
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';
import { useChannelManager } from './realtime/useChannelManager';
import { useMessageState } from './realtime/useMessageState';
import { useRealtimeConnection } from './realtime/useRealtimeConnection';
import { useMessageLoader } from './realtime/useMessageLoader';
import { useMessageActions } from './realtime/useMessageActions';

interface UseSimpleChat {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useSimpleChat(channelName: string): UseSimpleChat {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { channelId, initializeChannel } = useChannelManager(channelName);
  const { messages, addMessage, removeMessage, setMessages } = useMessageState();
  const { isConnected, setupSubscription } = useRealtimeConnection();
  const { loadMessages } = useMessageLoader();
  const { sendMessage: sendMessageAction, deleteMessage: deleteMessageAction } = useMessageActions();

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No authenticated user, showing unauthenticated view');
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Initializing chat for channel:', channelName);
      
      const resolvedChannelId = await initializeChannel();
      if (!resolvedChannelId) {
        console.error('Failed to initialize channel');
        setError('Failed to initialize channel');
        setIsLoading(false);
        return;
      }

      console.log('✅ Channel initialized:', resolvedChannelId);

      // Load existing messages
      try {
        console.log('🔄 Loading messages...');
        const messagesData = await loadMessages(resolvedChannelId);
        console.log('✅ Messages loaded:', messagesData.length);
        setMessages(messagesData);
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        setMessages([]);
        // Don't set error state for message loading failures, just log them
      }

      // Set up realtime subscription
      console.log('🔄 Setting up realtime subscription...');
      const cleanup = setupSubscription(
        resolvedChannelId,
        addMessage,
        removeMessage
      );

      console.log('✅ Chat initialization complete');
      return cleanup;
      
    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setError('Failed to initialize chat. Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channelName, initializeChannel, loadMessages, setMessages, setupSubscription, addMessage, removeMessage]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!channelId) {
      toast.error("Channel not ready. Please wait and try again.");
      console.error('Channel ID not available:', { channelId, channelName });
      return;
    }
    
    try {
      console.log('📤 Attempting to send message:', { 
        content: content.substring(0, 50) + '...', 
        channelId, 
        channelName,
        userId: user.id 
      });
      await sendMessageAction(content, channelId);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      // Error is already handled in sendMessageAction with toast
    }
  }, [user?.id, channelId, channelName, sendMessageAction]);
  
  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      await deleteMessageAction(messageId, setMessages);
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      // Error is already handled in deleteMessageAction with toast
    }
  }, [user?.id, deleteMessageAction, setMessages]);

  useEffect(() => {
    const cleanup = initializeChat();
    return () => {
      if (cleanup) {
        cleanup.then(cleanupFn => cleanupFn && cleanupFn());
      }
    };
  }, [initializeChat]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 useSimpleChat Debug:', {
      channelName,
      channelId,
      user: user?.id,
      isConnected,
      messagesCount: messages.length,
      isLoading,
      error
    });
  }, [channelName, channelId, user?.id, isConnected, messages.length, isLoading, error]);
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
