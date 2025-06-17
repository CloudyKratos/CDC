
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatManager, ChatState } from '@/services/community/ChatManager';
import { toast } from 'sonner';

export function useChatManager(channelName: string) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    isConnected: false,
    channelId: null,
    error: null
  });

  const { user } = useAuth();
  const chatManager = ChatManager.getInstance();

  // Initialize channel and subscribe to state changes
  useEffect(() => {
    if (!user?.id || !channelName) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    let mounted = true;

    const unsubscribe = chatManager.subscribe((newState) => {
      if (mounted) {
        setState(newState);
      }
    });

    // Initialize the channel
    chatManager.initializeChannel(channelName, user.id).catch(error => {
      if (mounted) {
        console.error('Failed to initialize chat:', error);
        toast.error('Failed to connect to chat');
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
      chatManager.cleanup();
    };
  }, [user?.id, channelName, chatManager]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) {
      toast.error('Must be logged in to send messages');
      return;
    }

    try {
      await chatManager.sendMessage(content, user.id);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [user?.id, chatManager]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await chatManager.deleteMessage(messageId, user.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [user?.id, chatManager]);

  const replyToMessage = useCallback((messageId: string) => {
    console.log('📝 Reply to message:', messageId);
    toast.info('Reply feature coming soon!');
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    console.log('👍 Add reaction:', reaction, 'to message:', messageId);
    toast.info('Reactions feature coming soon!');
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    isConnected: state.isConnected,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction
  };
}
