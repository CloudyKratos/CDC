
import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Message } from "@/types/chat";
import ChatMessage from './ChatMessage';
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [newMessagesCount, setNewMessagesCount] = useState(0);

  // Auto-scroll to bottom when new messages arrive (if user isn't scrolling)
  useEffect(() => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessagesCount(0);
    } else if (isUserScrolling) {
      setNewMessagesCount(prev => prev + 1);
    }
  }, [messages.length, isUserScrolling]);

  // Handle scroll events to detect if user is scrolling
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      setIsUserScrolling(!isNearBottom);
      setShowScrollToBottom(!isNearBottom);
      
      if (isNearBottom) {
        setNewMessagesCount(0);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
    setShowScrollToBottom(false);
    setNewMessagesCount(0);
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Start the Conversation
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Be the first to share your thoughts and connect with the community.
          </p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        <div className="p-4 space-y-6">
          {Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {formatDateHeader(date)}
                  </span>
                </div>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              </div>
              
              {/* Messages for this date */}
              <div className="space-y-1">
                {dayMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onReply={onReplyMessage}
                    onReaction={onReactionAdd}
                    onDelete={onDeleteMessage}
                    isLast={index === dayMessages.length - 1}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Loading indicator for new messages */}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className={cn(
              "rounded-full shadow-lg transition-all duration-200",
              "bg-blue-600 hover:bg-blue-700 text-white",
              newMessagesCount > 0 && "animate-pulse"
            )}
          >
            {newMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 mr-2 min-w-[20px] text-center">
                {newMessagesCount > 99 ? '99+' : newMessagesCount}
              </span>
            )}
            ↓
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageList;
