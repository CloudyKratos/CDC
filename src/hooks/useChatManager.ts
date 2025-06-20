
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatManager } from '@/services/community/ChatManager';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useChatManager(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const chatManager = ChatManager.getInstance();

  // Subscribe to chat state changes
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = chatManager.subscribe((state) => {
      setMessages(state.messages);
      setIsLoading(state.isLoading);
      setIsConnected(state.isConnected);
      setChannelId(state.channelId);
      setError(state.error);
    });

    // Initialize the channel
    chatManager.initializeChannel(channelName, user.id);

    return () => {
      unsubscribe();
      chatManager.cleanup();
    };
  }, [channelName, user?.id, chatManager]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) return;

    try {
      await chatManager.sendMessage(content, user.id);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  }, [user?.id, chatManager]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await chatManager.deleteMessage(messageId, user.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id, chatManager]);

  const reconnect = useCallback(() => {
    if (user?.id) {
      chatManager.initializeChannel(channelName, user.id);
    }
  }, [channelName, user?.id, chatManager]);

  return {
    messages,
    isLoading,
    isConnected,
    error,
    channelId,
    sendMessage,
    deleteMessage,
    reconnect
  };
}
