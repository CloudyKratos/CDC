
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => void;
  isConnected: boolean;
  activeChannel: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  isConnected,
  activeChannel
}) => {
  const { user } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom);
  };

  // Auto-scroll when new messages arrive (only if user is near bottom)
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    if (isNearBottom) {
      scrollToBottom();
    }
  }, [messages]);

  // Handle sending messages
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isSending || !isConnected) return false;

    setIsSending(true);
    try {
      return await onSendMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  // Mock functions for reply and reaction (not implemented yet)
  const handleReply = (messageId: string) => {
    console.log('Reply to message:', messageId);
  };

  const handleReaction = async (messageId: string, reaction: string) => {
    console.log('Add reaction:', reaction, 'to message:', messageId);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Welcome to #{activeChannel}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Start the conversation by sending the first message!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const prevMessage = index > 0 ? messages[index - 1] : null;
              const showAvatar = !prevMessage || 
                prevMessage.sender_id !== message.sender_id ||
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() > 300000; // 5 minutes

              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  isOwn={message.sender_id === user?.id}
                  onDelete={() => onDeleteMessage(message.id)}
                  onReply={() => handleReply(message.id)}
                  onReaction={(reaction) => handleReaction(message.id, reaction)}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="fixed bottom-20 right-8 rounded-full w-12 h-12 shadow-lg z-10"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <MessageInput
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          isSending={isSending}
          activeChannel={activeChannel}
        />
      </div>
    </div>
  );
};

export default ChatWindow;
