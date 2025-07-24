
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';
import { MessageHoverActions } from './MessageHoverActions';

interface EnhancedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  isConsecutive = false,
  onReply,
  onReact,
  onDelete,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);

  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const senderName = message.sender?.full_name || message.sender?.username || 'Unknown User';
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').toUpperCase();

  const handleReply = (messageId: string) => {
    onReply?.(messageId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    onReact?.(messageId, emoji);
  };

  return (
    <div 
      className={`group relative flex gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-lg p-3 transition-colors ${isConsecutive ? 'mt-1' : 'mt-4'} ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={senderName}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
              {senderInitials}
            </div>
          )}
        </div>
      )}

      {/* Spacer for consecutive messages */}
      {!showAvatar && <div className="w-8" />}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header with name and time */}
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {senderName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
          </div>
        )}

        {/* Message Text */}
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>

      {/* Hover Actions */}
      <MessageHoverActions
        messageId={message.id}
        onReply={handleReply}
        onReact={handleReact}
        visible={showActions}
      />
    </div>
  );
};
