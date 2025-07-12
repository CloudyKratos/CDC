import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useChatActions = (
  sendMessage: (content: string) => Promise<boolean>,
  deleteMessage: (messageId: string) => Promise<void>,
  replyToMessage: (messageId: string) => Promise<void>,
  addReaction: (messageId: string, reaction: string) => Promise<void>,
  isOnline: boolean
) => {
  const { user } = useAuth();

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isOnline) {
      console.warn('Cannot send message: Not online');
      return;
    }
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage, isOnline]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!isOnline) {
      console.warn('Cannot delete message: Not online');
      return;
    }
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [deleteMessage, isOnline]);

  const handleReplyMessage = useCallback(async (messageId: string) => {
    if (!isOnline) {
      console.warn('Cannot reply to message: Not online');
      return;
    }
    try {
      await replyToMessage(messageId);
    } catch (error) {
      console.error('Failed to reply to message:', error);
    }
  }, [replyToMessage, isOnline]);

  const handleReactionAdd = useCallback(async (messageId: string, reaction: string) => {
    if (!isOnline) {
      console.warn('Cannot add reaction: Not online');
      return;
    }
    try {
      await addReaction(messageId, reaction);
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  }, [addReaction, isOnline]);

  return {
    handleSendMessage,
    handleDeleteMessage,
    handleReplyMessage,
    handleReactionAdd,
  };
};
