
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import CommunityService from '@/services/community/CommunityService';
import { toast } from 'sonner';

export function useCommunityChat(channelName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const { user } = useAuth();

  // Load messages when channel changes
  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      if (!user?.id || !channelName) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Loading messages for channel:', channelName);
        const fetchedMessages = await CommunityService.getMessages(channelName);
        
        if (mounted) {
          setMessages(fetchedMessages);
          console.log('✅ Messages loaded:', fetchedMessages.length);
        }
      } catch (err) {
        console.error('❌ Error loading messages:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load messages');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      mounted = false;
    };
  }, [user?.id, channelName]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user?.id || !channelName) return;

    console.log('🔄 Setting up real-time subscription for:', channelName);
    
    const unsubscribe = CommunityService.subscribeToMessages(channelName, (newMessage) => {
      console.log('📨 New message received via subscription:', newMessage);
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        return [...prev, newMessage];
      });
    });

    setIsConnected(true);

    return () => {
      console.log('🧹 Cleaning up subscription for:', channelName);
      setIsConnected(false);
      unsubscribe();
    };
  }, [user?.id, channelName]);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) {
      toast.error('Cannot send empty message');
      return;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50) + '...');
      const newMessage = await CommunityService.sendMessage(content, channelName);
      console.log('✅ Message sent successfully:', newMessage.id);
      
      // Add message optimistically to UI
      setMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        
        return [...prev, newMessage];
      });
      
    } catch (err) {
      console.error('❌ Error sending message:', err);
      toast.error('Failed to send message');
      throw err;
    }
  }, [user?.id, channelName]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await CommunityService.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (err) {
      console.error('❌ Error deleting message:', err);
      toast.error('Failed to delete message');
      throw err;
    }
  }, [user?.id]);

  const replyToMessage = useCallback((messageId: string) => {
    console.log('📝 Reply to message:', messageId);
    // For now, just log the reply action
    // This can be expanded later with actual reply functionality
    toast.info('Reply feature coming soon!');
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    console.log('👍 Add reaction:', reaction, 'to message:', messageId);
    // For now, just log the reaction action
    // This can be expanded later with actual reaction functionality
    toast.info('Reactions feature coming soon!');
  }, []);

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction
  };
}
