
import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { EnhancedMessageActions } from './EnhancedMessageActions';

interface EnhancedModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onSendReply?: (content: string, parentId: string) => Promise<boolean>;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  isConnected?: boolean;
  isThread?: boolean;
  hideActions?: boolean;
  className?: string;
}

export const EnhancedModernMessageBubble: React.FC<EnhancedModernMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onReply,
  onReact,
  onRemoveReaction,
  onPin,
  onReport,
  onSendReply,
  showAvatar = true,
  isConsecutive = false,
  isConnected = true,
  isThread = false,
  hideActions = false,
  className = ''
}) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  const handleReply = () => {
    if (onReply) {
      onReply(message.id);
    }
  };

  const handleReact = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
  };
  
  return (
    <div className={`group flex gap-3 hover:bg-gradient-to-r hover:from-transparent hover:via-primary/5 hover:to-transparent rounded-2xl p-3 transition-all duration-300 hover:shadow-sm animate-fade-in ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-4'} ${className}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0 animate-scale-in">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name || message.sender.username || 'User'}
              className="w-9 h-9 rounded-full border-2 border-background shadow-lg ring-2 ring-primary/10 transition-all duration-200 hover:ring-primary/20 hover:scale-105"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg ring-2 ring-background transition-all duration-200 hover:shadow-xl hover:scale-105">
              {(message.sender?.full_name || message.sender?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Spacer for consecutive messages */}
      {!showAvatar && <div className="w-9" />}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : 'text-left'}`}>
        {/* Header with name and time */}
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-2 animate-fade-in ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-bold text-foreground tracking-tight">
              {isOwn ? 'You' : (message.sender?.full_name || message.sender?.username || 'Unknown User')}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {timeAgo}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative group/message ${isOwn ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className={`
            relative max-w-md px-5 py-3.5 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg group-hover:shadow-md
            ${isOwn 
              ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground rounded-br-md shadow-primary/25' 
              : 'bg-card text-card-foreground border border-border rounded-bl-md hover:border-primary/20 hover:bg-card/80 backdrop-blur-sm'
            }
            ${!isConnected ? 'opacity-70' : ''}
            animate-scale-in
          `}>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap font-medium">
              {message.content}
            </p>

            {/* Message Actions */}
            {!hideActions && (
              <div className={`absolute -top-3 ${isOwn ? '-left-3' : '-right-3'} opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100`}>
                <EnhancedMessageActions
                  messageId={message.id}
                  isOwn={isOwn}
                  onReply={onReply}
                  onReact={onReact}
                  onPin={onPin}
                  onReport={onReport}
                  onDelete={onDelete}
                />
              </div>
            )}
          </div>
        </div>

        {/* Enhanced delivery status for own messages */}
        {isOwn && (
          <div className={`flex justify-end mt-2 ${isOwn ? 'mr-5' : 'ml-5'} animate-fade-in`}>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
              {isConnected ? (
                <>
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="tracking-wide">Delivered</span>
                </>
              ) : (
                <>
                  <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-pulse"></div>
                  <span className="tracking-wide">Sending...</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
