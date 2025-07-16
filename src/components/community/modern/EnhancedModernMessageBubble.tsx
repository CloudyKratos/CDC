
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
    <div className={`group flex gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-xl p-3 transition-all duration-200 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-4'} ${className}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name || message.sender.username || 'User'}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 shadow-sm ring-2 ring-gray-100 dark:ring-gray-800"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm ring-2 ring-white dark:ring-gray-700">
              {(message.sender?.full_name || message.sender?.username || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      )}

      {/* Spacer for consecutive messages */}
      {!showAvatar && <div className="w-8" />}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : 'text-left'}`}>
        {/* Header with name and time */}
        {showAvatar && (
          <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {isOwn ? 'You' : (message.sender?.full_name || message.sender?.username || 'Unknown User')}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeAgo}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={`relative group/message ${isOwn ? 'flex justify-end' : 'flex justify-start'}`}>
          <div className={`
            relative max-w-md px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md
            ${isOwn 
              ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md hover:border-gray-300 dark:hover:border-gray-600'
            }
            ${!isConnected ? 'opacity-70' : ''}
          `}>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Message Actions */}
            {!hideActions && (
              <div className={`absolute -top-2 ${isOwn ? '-left-2' : '-right-2'} transition-opacity duration-200`}>
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

        {/* Delivery status for own messages */}
        {isOwn && (
          <div className={`flex justify-end mt-1 ${isOwn ? 'mr-4' : 'ml-4'}`}>
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              {isConnected ? (
                <>
                  <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                  Sent
                </>
              ) : (
                <>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                  Sending...
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
