
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { useChannelManager } from './useChannelManager';
import { useMessageLoader } from './useMessageLoader';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useMessageActions } from './useMessageActions';

export function useSimpleChat(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  
  // Use the smaller hooks
  const { channelId, setChannelId, getOrCreateChannel } = useChannelManager();
  const { loadMessages } = useMessageLoader();
  const { isConnected, setupRealtimeSubscription, cleanup } = useRealtimeSubscription();
  const { sendMessage: sendMessageAction, deleteMessage: deleteMessageAction } = useMessageActions();

  // Wrapper functions to maintain the same API
  const sendMessage = async (content: string): Promise<boolean> => {
    if (!channelId) {
      console.error('No channel available');
      return false;
    }
    try {
      await sendMessageAction(content, channelId);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
      return false;
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      await deleteMessageAction(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete message');
    }
  };

  // Initialize channel and load messages
  useEffect(() => {
    let mounted = true;

    const initializeChat = async () => {
      if (!user?.id || !channelName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('🔄 Initializing chat for:', channelName);

        // Get or create channel
        const id = await getOrCreateChannel(channelName);
        if (!mounted) return;

        if (!id) {
          throw new Error('Failed to get/create channel');
        }

        setChannelId(id);

        // Load existing messages
        const existingMessages = await loadMessages(id);
        if (!mounted) return;

        setMessages(existingMessages);
        
        // Set up realtime subscription
        setupRealtimeSubscription(id, setMessages);

        console.log('✅ Chat initialized with', existingMessages.length, 'messages');

      } catch (err) {
        console.error('💥 Failed to initialize chat:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize chat');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      mounted = false;
      cleanup();
    };
  }, [user?.id, channelName, getOrCreateChannel, loadMessages, setupRealtimeSubscription, cleanup]);

  // Always return a consistent object structure
  return {
    messages,
    isLoading,
    error,
    isConnected,
    channelId,
    sendMessage,
    deleteMessage
  };
}
