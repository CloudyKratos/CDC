
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { useChannelInitialization } from './use-channel-initialization';
import { useMessageLoader } from './use-message-loader';
import { useRealtimeSubscription } from './use-realtime-subscription';
import { useMessageSender } from './use-message-sender';

export function useCommunityMessages(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const {
    channelId,
    error,
    initializeChannel,
    cleanup: cleanupChannel
  } = useChannelInitialization();
  
  const { loadMessages } = useMessageLoader();
  const { isConnected, setupRealtimeSubscription, cleanup: cleanupSubscription } = useRealtimeSubscription();
  const { sendMessage: sendMessageCore } = useMessageSender();

  // Load messages when channel is ready
  const loadChannelMessages = useCallback(async () => {
    if (!channelId) return;

    try {
      const loadedMessages = await loadMessages(channelId);
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [channelId, loadMessages]);

  // Send message wrapper
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId) return false;
    return sendMessageCore(channelId, content, setMessages);
  }, [channelId, sendMessageCore]);

  // Initialize channel
  useEffect(() => {
    if (user?.id && channelName) {
      initializeChannel(channelName);
    }
    
    return cleanupChannel;
  }, [user?.id, channelName, initializeChannel, cleanupChannel]);

  // Load messages when channel is ready
  useEffect(() => {
    if (channelId) {
      loadChannelMessages();
    }
  }, [channelId, loadChannelMessages]);

  // Setup realtime subscription
  useEffect(() => {
    if (channelId && user?.id) {
      const cleanup = setupRealtimeSubscription(channelId, setMessages);
      return cleanup;
    }
  }, [channelId, user?.id, setupRealtimeSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSubscription();
      cleanupChannel();
    };
  }, [cleanupSubscription, cleanupChannel]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  };
}
