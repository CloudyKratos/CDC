
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Message } from '@/types/chat';
import MessageGroupByDate from './MessageGroupByDate';
import ScrollToBottom from './ScrollToBottom';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  activeChannel?: string;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => Promise<void>;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  activeChannel = 'general',
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

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Welcome to #{activeChannel}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Be the first to start the conversation!
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
            <MessageGroupByDate
              key={date}
              date={date}
              messages={dayMessages}
              onDeleteMessage={onDeleteMessage}
              onReplyMessage={onReplyMessage}
              onReactionAdd={onReactionAdd}
            />
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

      <ScrollToBottom
        showScrollToBottom={showScrollToBottom}
        newMessagesCount={newMessagesCount}
        onScrollToBottom={scrollToBottom}
      />
    </div>
  );
};

export default MessageList;
