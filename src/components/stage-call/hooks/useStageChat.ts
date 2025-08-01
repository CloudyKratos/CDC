
import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'hand-raise' | 'mute-toggle';
}

export const useStageChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setUnreadCount(prev => prev + 1);
  }, []);

  const addSystemMessage = useCallback((message: string) => {
    addMessage({
      userId: 'system',
      userName: 'System',
      message,
      type: 'system',
    });
  }, [addMessage]);

  const clearUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setUnreadCount(0);
  }, []);

  return {
    messages,
    unreadCount,
    addMessage,
    addSystemMessage,
    clearUnread,
    clearMessages,
  };
};
