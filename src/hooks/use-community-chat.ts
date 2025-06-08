
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/CommunityService';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseCommunityChat {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  replyToMessage: (messageId: string) => void;
  addReaction: (messageId: string, reaction: string) => Promise<void>;
}

export function useCommunityChat(channelName: string): UseCommunityChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  
  // Fetch initial messages and set up subscription
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeChat = async () => {
      setIsLoading(true);
      
      try {
        // Join the channel if user is authenticated
        if (user?.id) {
          await CommunityService.joinChannel(channelName, user.id);
        }
        
        // Load existing messages
        const messagesData = await CommunityService.getMessages(channelName);
        setMessages(messagesData);
        
        // Set up realtime subscription
        unsubscribe = CommunityService.subscribeToMessages(
          channelName, 
          (newMessage) => {
            setMessages(prev => {
              // Check if message is already in the list
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              
              return [...prev, newMessage].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
            });
          }
        );
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
    
    // Cleanup subscription when component unmounts or channel changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, channelName]);
  
  // Send a message to the current channel
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !content.trim()) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      await CommunityService.sendMessage(content.trim(), channelName);
      // Don't add to local state - let the subscription handle it
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }, [user?.id, channelName]);
  
  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      await CommunityService.deleteMessage(messageId);
      
      // Remove the message from the UI
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);
  
  // Reply to a message (simplified implementation)
  const replyToMessage = useCallback((messageId: string) => {
    if (!user?.id) return;
    
    // For now just show a toast - would need backend support for proper threading
    toast.info('Reply feature coming soon!');
  }, [user?.id]);
  
  // Add a reaction to a message
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user?.id) return;
    
    try {
      // This would need backend support for reactions
      console.log(`Adding reaction ${reaction} to message ${messageId}`);
      // Don't show automatic toast here - let the UI component handle it
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [user?.id]);
  
  return {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction
  };
}
