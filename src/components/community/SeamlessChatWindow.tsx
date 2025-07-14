
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import MessageBubble from './MessageBubble';
import EnhancedMessageInput from './input/EnhancedMessageInput';
import { Button } from '@/components/ui/button';
import { ArrowDown, Users, Wifi, WifiOff } from 'lucide-react';
import { useChatActions } from './hooks/useChatActions';

interface SeamlessChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReplyToMessage: (messageId: string) => void;
  onAddReaction: (messageId: string, reaction: string) => Promise<void>;
  isConnected: boolean;
  isSending: boolean;
  activeChannel: string;
  onlineUsers?: number;
}

const SeamlessChatWindow: React.FC<SeamlessChatWindowProps> = ({
  messages,
  onSendMessage,
  onDeleteMessage,
  onReplyToMessage,
  onAddReaction,
  isConnected,
  isSending,
  activeChannel,
  onlineUsers = 0
}) => {
  const { user } = useAuth();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const {
    handleSendMessage,
    handleDeleteMessage,
    handleReactionAdd,
    handleReplyMessage
  } = useChatActions(
    onSendMessage,
    onDeleteMessage,
    onReplyToMessage,
    onAddReaction,
    isConnected
  );

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll events
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setShowScrollButton(!isNearBottom && messages.length > 5);
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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            #{activeChannel}
          </h3>
          {onlineUsers > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{onlineUsers} online</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-1 text-green-600 text-xs">
              <Wifi className="w-3 h-3" />
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-600 text-xs">
              <WifiOff className="w-3 h-3" />
              <span>Reconnecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="max-w-md">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Welcome to #{activeChannel}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                This is the beginning of your conversation in #{activeChannel}.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Start typing below to send your first message!
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
                  onDelete={() => handleDeleteMessage(message.id)}
                  onReply={() => handleReplyMessage(message.id)}
                  onReaction={(reaction) => handleReactionAdd(message.id, reaction)}
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
            className="fixed bottom-32 right-8 rounded-full w-12 h-12 shadow-lg z-10 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Enhanced Message Input */}
      <EnhancedMessageInput
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        isSending={isSending}
        activeChannel={activeChannel}
      />
    </div>
  );
};

export default SeamlessChatWindow;
