
import { useState, useCallback } from 'react';
import { Message } from '@/types/chat';

interface UseMessageState {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  addMessage: (message: Message) => void;
  removeMessage: (messageId: string) => void;
  clearMessages: () => void;
}

export function useMessageState(): UseMessageState {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => {
      // Check if message already exists
      const exists = prev.some(m => m.id === message.id);
      if (exists) return prev;
      
      return [...prev, message].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    setMessages,
    addMessage,
    removeMessage,
    clearMessages
  };
}
