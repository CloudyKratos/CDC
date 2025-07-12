import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export function useDirectMessages(recipientId?: string) {
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const convs = await DirectMessageService.getConversations();
      setConversations(convs);
      setError(null);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load messages for specific recipient
  const loadMessages = useCallback(async (targetRecipientId: string) => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const msgs = await DirectMessageService.getMessages(targetRecipientId);
      setMessages(msgs);
      
      // Mark messages as read
      await DirectMessageService.markAsRead(targetRecipientId);
      setError(null);
    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Send message
  const sendMessage = useCallback(async (content: string, targetRecipientId?: string) => {
    if (!user?.id) {
      toast.error('Must be logged in to send messages');
      return;
    }

    const recipient = targetRecipientId || recipientId;
    if (!recipient) {
      toast.error('No recipient specified');
      return;
    }

    try {
      const newMessage = await DirectMessageService.sendMessage(recipient, content);
      
      // Add message to local state optimistically
      setMessages(prev => [...prev, newMessage]);
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  }, [user?.id, recipientId, loadConversations]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await DirectMessageService.deleteMessage(messageId);
      
      // Remove message from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Set up connection status (simulated since no real-time yet)
  useEffect(() => {
    if (user?.id) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  }, [user?.id]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load messages when recipient changes
  useEffect(() => {
    if (recipientId) {
      loadMessages(recipientId);
    }
  }, [recipientId, loadMessages]);

  return {
    messages,
    conversations,
    isLoading,
    isConnected,
    error,
    sendMessage,
    deleteMessage,
    loadConversations,
    loadMessages
  };
}
