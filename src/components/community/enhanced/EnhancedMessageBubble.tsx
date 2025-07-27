
import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Reply, Heart, Smile, Trash2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const senderName = message.sender?.full_name || message.sender?.username || 'Unknown User';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={cn(
        "group relative transition-all duration-200 px-4 py-2",
        "hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-lg",
        isConsecutive ? "mt-1" : "mt-4",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      <div className="flex gap-3">
        {/* Avatar Column */}
        <div className="flex-shrink-0 w-10">
          {showAvatar ? (
            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800 shadow-sm">
              <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
                {senderName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and timestamp */}
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {senderName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {timeAgo}
              </span>
            </div>
          )}

          {/* Message Body */}
          <div className="relative">
            <div className={cn(
              "p-3 rounded-2xl max-w-2xl shadow-sm border transition-all duration-200",
              isOwn 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 ml-auto rounded-br-md" 
                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-bl-md",
              "hover:shadow-md"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              
              {/* Message status for own messages */}
              {isOwn && (
                <div className="flex items-center justify-end mt-2 gap-1">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                    <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                  </div>
                  <span className="text-xs text-blue-200 ml-1">Sent</span>
                </div>
              )}
            </div>

            {/* Hover Actions */}
            {showActions && (
              <div className="absolute -top-2 right-0 opacity-100 transition-all duration-200">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact?.(message.id, '❤️')}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactions(!showReactions)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply?.(message.id)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  >
                    <Reply className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  {isOwn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(message.id)}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Reactions Panel */}
            {showReactions && (
              <div className="absolute top-full right-0 mt-2 z-10">
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
                  {['👍', '❤️', '😊', '😢', '😮', '🔥'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onReact?.(message.id, emoji);
                        setShowReactions(false);
                      }}
                      className="h-8 w-8 p-0 text-base hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
