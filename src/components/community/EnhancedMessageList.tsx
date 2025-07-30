
import React, { useMemo } from 'react';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { MessageAvatar } from './MessageAvatar';
import { MessageTimestamp } from './MessageTimestamp';
import { MessageStatus } from './MessageStatus';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Trash2, Reply, Heart, Copy } from 'lucide-react';
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
  const [showActions, setShowActions] = React.useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={cn(
        "flex gap-3 px-4 py-2 hover:bg-muted/30 transition-all duration-200 group rounded-lg mx-2",
        isConsecutive && "mt-1",
        !isConsecutive && "mt-4"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar ? (
          <MessageAvatar 
            sender={message.sender} 
            size="md"
            showStatus={false}
          />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <MessageTimestamp 
              timestamp={message.created_at} 
              className="text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground text-sm">
              {message.sender?.full_name || message.sender?.username || 'Unknown User'}
            </span>
            <MessageTimestamp timestamp={message.created_at} className="text-muted-foreground" />
          </div>
        )}

        {/* Message body with improved styling */}
        <div className="relative group/message">
          <div className={cn(
            "inline-block max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm transition-all duration-200",
            isOwn 
              ? "bg-primary text-primary-foreground rounded-br-md ml-auto" 
              : "bg-muted/50 text-foreground border border-border/30 rounded-bl-md",
            "hover:shadow-md hover:scale-[1.02] origin-left"
          )}>
            <div className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </div>
          </div>

          {/* Hover Actions */}
          {showActions && (
            <div className="absolute -top-2 right-0 opacity-100 transition-all duration-200 z-10">
              <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply?.(message.id)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-primary hover:bg-muted"
                >
                  <Reply className="h-3 w-3" />
                </Button>
                
                {isOwn && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(message.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Message
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )}
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
      <div className={cn("flex flex-col items-center justify-center h-64 text-center", className)}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          No messages yet
        </h3>
        <p className="text-muted-foreground text-sm">
          Be the first to start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-0", className)}>
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
        <div className="flex items-center justify-center py-4">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
    </div>
  );
};
