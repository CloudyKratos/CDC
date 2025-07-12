
import { useCallback } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

export function useChatActions(
  sendMessage: (content: string) => Promise<boolean>,
  deleteMessage: (messageId: string) => Promise<void>,
  replyToMessage: (messageId: string) => void,
  addReaction: (messageId: string, reaction: string) => Promise<void>,
  isOnline: boolean
) {
  const { user } = useAuth();

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return false;
    }

    if (!isOnline) {
      toast.error("Cannot send message while offline. Message will be sent when connection is restored.");
      return false;
    }

    try {
      const success = await sendMessage(content);
      if (success) {
        // Optional: Show success feedback for slow connections
        // toast.success("Message sent!", { duration: 1000 });
      }
      return success;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      return false;
    }
  }, [user?.id, sendMessage, isOnline]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id, deleteMessage]);

  const handleReactionAdd = useCallback(async (messageId: string, reaction: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to react");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot add reactions while offline");
      return;
    }

    try {
      await addReaction(messageId, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [user?.id, addReaction, isOnline]);

  return {
    handleSendMessage,
    handleDeleteMessage,
    handleReactionAdd,
    handleReplyMessage: replyToMessage
  };
}
