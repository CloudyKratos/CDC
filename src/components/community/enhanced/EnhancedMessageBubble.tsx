
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
        "group relative transition-all duration-200 px-3 sm:px-4 py-2 sm:py-3",
        "hover:bg-slate-50/50 dark:hover:bg-slate-800/20 rounded-lg",
        "touch-manipulation", // Better touch response
        isConsecutive ? "mt-0.5 sm:mt-1" : "mt-3 sm:mt-4",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
      onTouchStart={() => setShowActions(true)} // Show actions on mobile touch
      onTouchEnd={() => {
        // Keep actions visible for a moment on mobile
        setTimeout(() => {
          if (!showReactions) setShowActions(false);
        }, 3000);
      }}
    >
      <div className="flex gap-2 sm:gap-3">
        {/* Avatar Column - Mobile responsive */}
        <div className="flex-shrink-0 w-8 sm:w-10">
          {showAvatar ? (
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 ring-2 ring-white dark:ring-slate-800 shadow-sm touch-target">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={senderName}
                className="object-cover" // Prevent clipped avatars
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs sm:text-sm">
                {senderName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
              <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>

        {/* Message Content - Mobile responsive */}
        <div className="flex-1 min-w-0 max-w-[calc(100vw-7rem)] sm:max-w-none">
          {/* Header with name and timestamp - Prevent overflow */}
          {showAvatar && (
            <div className="flex items-baseline gap-2 mb-1 overflow-hidden">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                {senderName}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                {timeAgo}
              </span>
            </div>
          )}

          {/* Message Body - Mobile responsive */}
          <div className="relative">
            <div className={cn(
              "p-3 sm:p-4 rounded-2xl max-w-full sm:max-w-2xl shadow-sm border transition-all duration-200",
              "will-change-transform", // Optimize animations
              isOwn 
                ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 ml-auto rounded-br-md" 
                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-bl-md",
              "hover:shadow-md active:shadow-lg" // Better mobile feedback
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
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

            {/* Mobile-optimized Action Buttons */}
            {showActions && (
              <div className="absolute -top-2 right-0 opacity-100 transition-all duration-200 z-10">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-1.5 sm:px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact?.(message.id, '❤️')}
                    className={cn(
                      "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target", // Larger on mobile
                      "text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400",
                      "active:scale-95 transition-transform" // Better mobile feedback
                    )}
                  >
                    <Heart className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactions(!showReactions)}
                    className={cn(
                      "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target",
                      "text-slate-500 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400",
                      "active:scale-95 transition-transform"
                    )}
                  >
                    <Smile className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply?.(message.id)}
                    className={cn(
                      "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target",
                      "text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400",
                      "active:scale-95 transition-transform"
                    )}
                  >
                    <Reply className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className={cn(
                      "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target",
                      "text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400",
                      "active:scale-95 transition-transform"
                    )}
                  >
                    <Copy className="h-4 w-4 sm:h-3 sm:w-3" />
                  </Button>
                  
                  {isOwn && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(message.id)}
                      className={cn(
                        "h-8 w-8 sm:h-6 sm:w-6 p-0 touch-target",
                        "text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400",
                        "active:scale-95 transition-transform"
                      )}
                    >
                      <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Mobile-optimized Reactions Panel */}
            {showReactions && (
              <div className="absolute top-full right-0 mt-2 z-20">
                <div className="flex items-center gap-1 sm:gap-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-3 py-2">
                  {['👍', '❤️', '😊', '😢', '😮', '🔥'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onReact?.(message.id, emoji);
                        setShowReactions(false);
                      }}
                      className={cn(
                        "h-10 w-10 sm:h-8 sm:w-8 p-0 text-lg sm:text-base touch-target", // Larger on mobile
                        "hover:scale-125 active:scale-110 transition-transform duration-200"
                      )}
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
