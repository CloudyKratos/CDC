
import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { MessageHoverActions } from './MessageHoverActions';

interface EnhancedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  className?: string;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onReply,
  onReact,
  onPin,
  onReport,
  showAvatar = true,
  isConsecutive = false,
  className = ''
}) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  // Render mentions in the message content
  const renderMessageContent = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a username (odd indices after split)
        return (
          <span
            key={index}
            className="bg-primary/20 text-primary px-1 rounded font-medium"
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  };
  
  return (
    <div className={`group relative flex gap-3 hover:bg-muted/30 rounded-xl p-3 transition-all duration-200 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-4'} ${className}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name || message.sender.username || 'User'}
              className="w-9 h-9 rounded-full border-2 border-background shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shadow-sm">
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
          <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-medium text-foreground">
              {isOwn ? 'You' : (message.sender?.full_name || message.sender?.username || 'Unknown User')}
            </span>
            <span className="text-xs text-muted-foreground">
              {timeAgo}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative ${isOwn ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className={`
            relative max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200
            ${isOwn 
              ? 'bg-primary text-primary-foreground rounded-br-md' 
              : 'bg-card text-card-foreground border border-border rounded-bl-md'
            }
          `}>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {renderMessageContent(message.content)}
            </p>
          </div>

          {/* Hover Actions */}
          <div className={`absolute top-0 ${isOwn ? '-left-2' : '-right-2'} transform -translate-y-1/2`}>
            <MessageHoverActions
              messageId={message.id}
              isOwnMessage={isOwn}
              onReply={onReply}
              onReact={onReact}
              onPin={onPin}
              onDelete={onDelete}
              onReport={onReport}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
