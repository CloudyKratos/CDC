
import React, { useMemo } from 'react';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { MessageAvatar } from './MessageAvatar';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageStatus } from './MessageStatus';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Reply } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EnhancedMessageListProps {
  messages: Message[];
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
  isLoading?: boolean;
  className?: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  isConsecutive: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  isConsecutive,
  onDelete,
  onReply
}) => {
  return (
    <div className={cn(
      "flex gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group",
      "touch-manipulation", // Improve touch responsiveness
      isConsecutive && "mt-0.5 sm:mt-1",
      !isConsecutive && "mt-3 sm:mt-4"
    )}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <MessageAvatar 
            sender={message.sender} 
            size="md"
            showStatus={false}
            className="touch-target" // Ensure minimum touch target size
          />
        ) : (
          <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
            <MessageTimestamp 
              timestamp={message.created_at} 
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0 max-w-[calc(100vw-8rem)] sm:max-w-none">
        {/* Header */}
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1 overflow-hidden">
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
              {message.sender?.full_name || message.sender?.username || 'Unknown User'}
            </span>
            <MessageTimestamp 
              timestamp={message.created_at} 
              className="flex-shrink-0"
            />
          </div>
        )}

        {/* Message body */}
        <div className="relative group">
          <div className={cn(
            "text-gray-900 dark:text-gray-100 text-sm leading-relaxed break-words",
            "whitespace-pre-wrap overflow-wrap-anywhere", // Better text wrapping
            "max-w-full" // Prevent overflow
          )}>
            {message.content}
          </div>

          {/* Message actions - Mobile optimized */}
          <div className={cn(
            "absolute -top-2 right-0 transition-opacity duration-200",
            "opacity-0 group-hover:opacity-100",
            "sm:opacity-0 sm:group-hover:opacity-100", // Desktop hover
            "touch:opacity-100" // Always visible on touch devices
          )}>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-2 py-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message.id)}
                className={cn(
                  "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target", // Larger on mobile
                  "text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                )}
              >
                <Reply className="h-4 w-4 sm:h-3 sm:w-3" />
              </Button>
              
              {isOwn && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target", // Larger on mobile
                        "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      )}
                    >
                      <MoreHorizontal className="h-4 w-4 sm:h-3 sm:w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem 
                      onClick={() => onDelete?.(message.id)}
                      className="text-red-600 dark:text-red-400 touch-target"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Message
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Message status for own messages */}
        {isOwn && (
          <div className="flex justify-end mt-1">
            <MessageStatus status="sent" />
          </div>
        )}
      </div>
    </div>
  );
};

export const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  onDeleteMessage,
  onReplyMessage,
  isLoading = false,
  className = ''
}) => {
  const { user } = useAuth();

  const processedMessages = useMemo(() => {
    return messages.map((message, index) => {
      const prevMessage = messages[index - 1];
      const isOwn = message.sender_id === user?.id;
      const isConsecutive = prevMessage &&
        prevMessage.sender_id === message.sender_id &&
        new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000; // 5 minutes
      
      return {
        ...message,
        isOwn,
        isConsecutive: !!isConsecutive,
        showAvatar: !isConsecutive
      };
    });
  }, [messages, user?.id]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className={cn("flex flex-col items-center justify-center min-h-[50vh] text-center px-4", className)}>
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No messages yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm max-w-sm">
          Be the first to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0 pb-safe", className)}>
      {processedMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isOwn={message.isOwn}
          showAvatar={message.showAvatar}
          isConsecutive={message.isConsecutive}
          onDelete={onDeleteMessage}
          onReply={onReplyMessage}
        />
      ))}
      
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
    </div>
  );
};
