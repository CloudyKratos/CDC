
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
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
  const sendMessage = async (content: string) => {
    if (!channelId) {
      throw new Error('No channel available');
    }
    await sendMessageAction(content, channelId);
  };

  const deleteMessage = async (messageId: string) => {
    await deleteMessageAction(messageId);
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
