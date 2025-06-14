
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Loader2, MessageSquare, ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Message } from "@/types/chat";
import ChatMessage from './ChatMessage';
import { cn } from "@/lib/utils";

interface EnhancedMessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => void;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(true);

  // Memoize grouped messages for performance
  const messageGroups = useMemo(() => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive (if user isn't scrolling)
  useEffect(() => {
    if (!isUserScrolling && hasScrolledToBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setNewMessagesCount(0);
    } else if (isUserScrolling && !hasScrolledToBottom) {
      setNewMessagesCount(prev => prev + 1);
    }
  }, [messages.length, isUserScrolling, hasScrolledToBottom]);

  // Improved scroll detection
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      setIsUserScrolling(true);
      setHasScrolledToBottom(isNearBottom);
      setShowScrollToBottom(!isNearBottom && messages.length > 0);
      
      if (isNearBottom) {
        setNewMessagesCount(0);
      }

      // Reset scrolling state after user stops scrolling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserScrolling(false);
    setShowScrollToBottom(false);
    setNewMessagesCount(0);
    setHasScrolledToBottom(true);
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

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-gray-900">
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="py-4">
          {Object.entries(messageGroups).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-6 px-4">
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
                    previousMessage={index > 0 ? dayMessages[index - 1] : undefined}
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
            <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Loading new messages...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced scroll to bottom button */}
      {showScrollToBottom && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            onClick={scrollToBottom}
            size="sm"
            className={cn(
              "rounded-full shadow-lg transition-all duration-200 h-10 w-10 p-0",
              "bg-blue-600 hover:bg-blue-700 text-white border-2 border-white dark:border-gray-800",
              newMessagesCount > 0 && "animate-pulse"
            )}
          >
            <div className="relative">
              <ArrowDown className="w-4 h-4" />
              {newMessagesCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {newMessagesCount > 99 ? '99+' : newMessagesCount}
                </div>
              )}
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessageList;
