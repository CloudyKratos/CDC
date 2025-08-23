import React, { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Wifi, WifiOff, ArrowDown } from 'lucide-react';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ImprovedTypingIndicator } from './ImprovedTypingIndicator';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface TypingUser {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface ImprovedMessagesListProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  isConnected: boolean;
  typingUsers?: TypingUser[];
  channelId?: string;
  onReconnect?: () => void;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, newContent: string) => Promise<boolean>;
  onReactToMessage?: (messageId: string, emoji: string) => void;
  onReplyToMessage?: (messageId: string) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export const ImprovedMessagesList: React.FC<ImprovedMessagesListProps> = ({
  messages,
  isLoading,
  error,
  isConnected,
  typingUsers = [],
  channelId,
  onReconnect,
  onDeleteMessage,
  onEditMessage,
  onReactToMessage,
  onReplyToMessage,
  onScrollToMessage
}) => {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(messages.length);

  // Auto-scroll to bottom for new messages (only if user is near bottom)
  const scrollToBottom = (force = false) => {
    if (force || isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsNearBottom(isAtBottom);
    setShowScrollToBottom(!isAtBottom && messages.length > 0);
  };

  // Auto-scroll when new messages arrive (only if user was near bottom)
  useEffect(() => {
    if (messages.length > lastMessageCount && isNearBottom) {
      setTimeout(scrollToBottom, 100);
    }
    setLastMessageCount(messages.length);
  }, [messages.length, lastMessageCount, isNearBottom]);

  // Scroll to bottom when component first loads
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [channelId]); // Only when channel changes

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
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

  // Format date for display
  const formatDate = (dateString: string) => {
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

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <h3 className="font-semibold mb-2">Unable to load messages</h3>
          <p className="text-muted-foreground text-sm mb-4">{error}</p>
          {onReconnect && (
            <Button onClick={onReconnect} variant="outline" size="sm">
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            💬
          </div>
          <h3 className="font-semibold mb-2">No messages yet</h3>
          <p className="text-muted-foreground text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Connection Status */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 dark:bg-yellow-900/10 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2"
        >
          <div className="flex items-center justify-center text-sm text-yellow-700 dark:text-yellow-300">
            <WifiOff className="w-4 h-4 mr-2" />
            <span>Connecting...</span>
          </div>
        </motion.div>
      )}

      {/* Messages */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1"
        onScrollCapture={handleScroll}
      >
        <div className="p-4 space-y-6">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              {/* Date Divider */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground font-medium">
                  {formatDate(date)}
                </div>
              </div>

              {/* Messages for this day */}
              <div className="space-y-2">
                {dayMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                   <EnhancedMessageBubble
                     message={message}
                     isOwn={message.sender_id === user?.id}
                     onDelete={onDeleteMessage}
                     onEdit={onEditMessage}
                     onReact={onReactToMessage}
                     onReply={onReplyToMessage}
                   />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          <ImprovedTypingIndicator 
            typingUsers={typingUsers} 
            className="mb-4"
          />

          {/* Loading more messages */}
          {isLoading && messages.length > 0 && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </ScrollArea>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 right-4 z-10"
          >
            <Button
              onClick={() => scrollToBottom(true)}
              size="sm"
              className="rounded-full shadow-lg"
              variant="secondary"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center space-x-1">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>
    </div>
  );
};