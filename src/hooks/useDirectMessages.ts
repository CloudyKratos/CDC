
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DirectMessageService, { DirectMessage, Conversation } from '@/services/messaging/DirectMessageService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const sendMessage = useCallback(async (content: string, targetRecipientId?: string, replyToId?: string) => {
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
      const newMessage = await DirectMessageService.sendMessage(recipient, content, replyToId);
      
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

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 DirectMessages: Setting up real-time subscription');

    const channel = supabase
      .channel('direct_messages_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages'
        },
        async (payload) => {
          console.log('📨 DirectMessages: New message received:', payload);
          const newMessage = payload.new as any;
          
          // Only add if it's for the current conversation
          if (recipientId && 
              ((newMessage.sender_id === user.id && newMessage.recipient_id === recipientId) ||
               (newMessage.sender_id === recipientId && newMessage.recipient_id === user.id))) {
            
            // Get sender profile
            const { data: sender } = await supabase
              .from('profiles')
              .select('id, username, full_name, avatar_url')
              .eq('id', newMessage.sender_id)
              .single();

            const message: DirectMessage = {
              id: newMessage.id,
              sender_id: newMessage.sender_id,
              recipient_id: newMessage.recipient_id,
              content: newMessage.content,
              created_at: newMessage.created_at,
              updated_at: newMessage.updated_at,
              is_read: newMessage.is_read,
              is_deleted: newMessage.is_deleted,
              reply_to_id: newMessage.reply_to_id,
              sender: sender || {
                id: newMessage.sender_id,
                username: 'Unknown User',
                full_name: 'Unknown User',
                avatar_url: null
              }
            };

            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === message.id)) return prev;
              return [...prev, message];
            });

            // Auto-mark as read if recipient is current user
            if (newMessage.recipient_id === user.id) {
              DirectMessageService.markAsRead(newMessage.sender_id);
            }
          }

          // Always refresh conversations for new messages
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'direct_messages'
        },
        (payload) => {
          const updatedMessage = payload.new as any;
          
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          } else {
            setMessages(prev => prev.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...msg, is_read: updatedMessage.is_read }
                : msg
            ));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 DirectMessages: Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🧹 DirectMessages: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id, recipientId, loadConversations]);

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
