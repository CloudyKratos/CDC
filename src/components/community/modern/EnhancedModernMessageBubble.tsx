
import React from 'react';
import { Message } from '@/types/chat';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  isConnected?: boolean;
}

export const EnhancedModernMessageBubble: React.FC<EnhancedModernMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  showAvatar = true,
  isConsecutive = false,
  isConnected = true
}) => {
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  
  return (
    <div className={`flex gap-3 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-lg p-2 transition-colors duration-200 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.full_name || message.sender.username || 'User'}
              className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
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
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
            relative max-w-md px-4 py-2 rounded-2xl shadow-sm
            ${isOwn 
              ? 'bg-blue-600 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
            }
            ${!isConnected ? 'opacity-70' : ''}
          `}>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Message Actions */}
            {isOwn && onDelete && (
              <div className="absolute -top-2 -left-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 bg-white dark:bg-gray-700 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-32">
                    <DropdownMenuItem
                      onClick={() => onDelete(message.id)}
                      className="text-red-600 dark:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>

        {/* Delivery status for own messages */}
        {isOwn && (
          <div className={`flex justify-end mt-1 ${isOwn ? 'mr-4' : 'ml-4'}`}>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {isConnected ? 'Sent' : 'Sending...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
