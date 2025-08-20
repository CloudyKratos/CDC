import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';
import { MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SimpleMessagesListProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  currentUserId: string;
}

export const SimpleMessagesList: React.FC<SimpleMessagesListProps> = ({
  messages,
  isLoading,
  error,
  currentUserId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center space-x-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-destructive mb-3 font-medium">Connection Error</p>
          <p className="text-sm text-muted-foreground mb-4">Unable to load messages</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-1">No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {messages.map((message, index) => {
          const isOwn = message.sender_id === currentUserId;
          const prevMessage = messages[index - 1];
          const showAvatar = !prevMessage || 
            prevMessage.sender_id !== message.sender_id ||
            (new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime()) > 300000; // 5 minutes

          const senderName = message.sender?.full_name || 
                           message.sender?.username || 
                           'Unknown User';
          
          return (
            <div
              key={message.id}
              className={cn(
                "flex items-end space-x-2",
                isOwn ? "justify-end" : "justify-start"
              )}
            >
              {/* Avatar - only show if not own message and conditions met */}
              {!isOwn && (
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={message.sender?.avatar_url || ''} 
                        alt={senderName} 
                      />
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-8 h-8" /> // Spacer
                  )}
                </div>
              )}

              {/* Message Content */}
              <div className={cn(
                "max-w-[70%] space-y-1",
                isOwn ? "items-end" : "items-start"
              )}>
                {/* Sender name and time - show for new messages */}
                {showAvatar && !isOwn && (
                  <div className="flex items-center space-x-2 px-1">
                    <span className="text-xs font-medium text-foreground">
                      {senderName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={cn(
                    "inline-block px-3 py-2 rounded-2xl max-w-full break-words",
                    isOwn
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  
                  {/* Time for own messages */}
                  {isOwn && (
                    <div className="text-xs opacity-70 mt-1 text-right">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};