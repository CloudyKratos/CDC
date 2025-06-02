
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
  replyToMessage: (messageId: string, content: string) => Promise<void>;
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
              
              return [...prev, newMessage];
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
      await CommunityService.sendMessage(content, channelName);
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
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);
  
  // Reply to a message
  const replyToMessage = useCallback(async (messageId: string, content: string) => {
    if (!user?.id || !content.trim()) return;
    
    try {
      // For now just send a normal message (would need backend support for proper threading)
      await sendMessage(content);
    } catch (error) {
      console.error('Error replying to message:', error);
      toast.error('Failed to reply to message');
    }
  }, [user?.id, sendMessage]);
  
  // Add a reaction to a message
  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    if (!user?.id) return;
    
    try {
      // This would need backend support for reactions
      toast.success(`Added reaction ${reaction}`);
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
