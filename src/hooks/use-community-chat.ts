
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/CommunityService';
import { Message } from '@/types/chat';

interface UseCommunityChat {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (content: string) => Promise<void>;
}

export function useCommunityChat(channelName: string): UseCommunityChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeChat = async () => {
      if (user?.id) {
        setIsLoading(true);
        
        try {
          // Join the channel
          await CommunityService.joinChannel(channelName, user.id);
          
          // Load existing messages
          const messagesData = await CommunityService.getMessages(channelName);
          setMessages(messagesData);
          
          // Set up realtime subscription for new messages
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
        } finally {
          setIsLoading(false);
        }
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
  
  const sendMessage = async (content: string) => {
    if (!user?.id || !content.trim()) return;
    
    try {
      await CommunityService.sendMessage(content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };
  
  return {
    messages,
    isLoading,
    sendMessage
  };
}
