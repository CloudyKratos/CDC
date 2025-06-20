
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

  const replyToMessage = useCallback((messageId: string) => {
    // For now, just log the reply action - this could be enhanced later
    console.log('Reply to message:', messageId);
    toast.info('Reply feature coming soon!');
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user?.id) return;

    try {
      // For now, just log the reaction - this could be enhanced later
      console.log('Add reaction:', { messageId, reaction, userId: user.id });
      toast.success(`Reacted with ${reaction}`);
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [user?.id]);

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
    replyToMessage,
    addReaction,
    reconnect
  };
}
