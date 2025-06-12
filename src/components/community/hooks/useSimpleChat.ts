
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
        return;
      }

      // Load existing messages
      try {
        const messagesData = await loadMessages(resolvedChannelId);
        setMessages(messagesData);
      } catch (error) {
        console.error('❌ Error loading messages:', error);
        setMessages([]);
      }

      // Set up realtime subscription
      const cleanup = setupSubscription(
        resolvedChannelId,
        addMessage,
        removeMessage
      );

      return cleanup;
      
    } catch (error) {
      console.error('💥 Chat initialization failed:', error);
      setError(null); // Don't show error UI, just fallback to basic functionality
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
      return;
    }
    
    try {
      console.log('📤 Attempting to send message:', { content, channelId });
      await sendMessageAction(content, channelId);
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }, [user?.id, channelId, sendMessageAction]);
  
  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      await deleteMessageAction(messageId, setMessages);
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
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
  
  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
