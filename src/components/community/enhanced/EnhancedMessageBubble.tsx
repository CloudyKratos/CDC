
import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Reply, Heart, Smile, Trash2 } from 'lucide-react';
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

  return (
    <div 
      className={cn(
        "group relative transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-xl p-3",
        isConsecutive ? "mt-1" : "mt-4",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={cn(
        "flex gap-3",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar ? (
            <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800 shadow-lg">
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
        <div className={cn(
          "flex-1 min-w-0",
          isOwn ? "text-right" : "text-left"
        )}>
          {/* Header with name and timestamp */}
          {showAvatar && (
            <div className={cn(
              "flex items-center gap-2 mb-2",
              isOwn ? "justify-end" : "justify-start"
            )}>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isOwn ? 'You' : senderName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {timeAgo}
              </span>
            </div>
          )}

          {/* Message Bubble */}
          <div className={cn(
            "relative max-w-md",
            isOwn ? "ml-auto" : "mr-auto"
          )}>
            <div className={cn(
              "px-4 py-3 rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md",
              isOwn 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 rounded-br-md" 
                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-bl-md hover:border-blue-200 dark:hover:border-blue-800"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
              
              {/* Delivery status for own messages */}
              {isOwn && (
                <div className="flex items-center justify-end mt-1 gap-1">
                  <div className="w-1 h-1 bg-blue-200 rounded-full"></div>
                  <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                  <span className="text-xs text-blue-200 ml-1">Sent</span>
                </div>
              )}
            </div>

            {/* Message Actions */}
            {showActions && (
              <div className={cn(
                "absolute -top-2 opacity-100 transition-all duration-200 transform scale-100",
                isOwn ? "-left-2" : "-right-2"
              )}>
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
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Reactions Panel */}
            {showReactions && (
              <div className={cn(
                "absolute top-full mt-2 z-10",
                isOwn ? "right-0" : "left-0"
              )}>
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
