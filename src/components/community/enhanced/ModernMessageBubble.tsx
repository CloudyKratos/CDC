
import React, { useState } from 'react';
import { Message } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Smile, 
  Trash2, 
  Copy,
  Check,
  CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  isConnected?: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export const ModernMessageBubble: React.FC<ModernMessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  isConsecutive = false,
  isConnected = true,
  onReply,
  onReact,
  onDelete,
  className
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const senderName = message.sender?.full_name || message.sender?.username || 'Unknown User';
  const timeAgo = formatDistanceToNow(new Date(message.created_at), { addSuffix: true });
  const timeStamp = format(new Date(message.created_at), 'h:mm a');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div 
      className={cn(
        "group flex gap-3 px-4 py-1 transition-all duration-200",
        isOwn ? "flex-row-reverse" : "flex-row",
        isConsecutive ? "mt-1" : "mt-4",
        "hover:bg-slate-50/50 dark:hover:bg-slate-800/30",
        className
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowReactions(false);
      }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10">
        {showAvatar ? (
          <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
            <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium text-sm">
              {senderName[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {timeStamp}
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0 max-w-[70%]",
        isOwn ? "text-right" : "text-left"
      )}>
        {/* Header with name and timestamp */}
        {showAvatar && !isOwn && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {senderName}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {timeAgo}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div className={cn(
          "relative group/bubble",
          isOwn ? "flex justify-end" : "flex justify-start"
        )}>
          <div className={cn(
            "relative px-4 py-2.5 rounded-2xl shadow-sm border transition-all duration-200 max-w-full break-words",
            isOwn 
              ? "bg-blue-600 text-white border-blue-600 rounded-br-md shadow-blue-600/25 hover:shadow-blue-600/40" 
              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 rounded-bl-md hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600",
            "hover:scale-[1.02] origin-left"
          )}>
            {/* Message Text */}
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Message Status for own messages */}
            {isOwn && (
              <div className="flex items-center justify-end mt-1 gap-1">
                <span className="text-xs text-blue-200 opacity-75">
                  {timeStamp}
                </span>
                <div className="flex items-center">
                  {isConnected ? (
                    <CheckCheck className="w-3 h-3 text-blue-200" />
                  ) : (
                    <Check className="w-3 h-3 text-blue-200" />
                  )}
                </div>
              </div>
            )}

            {/* Hover Actions */}
            {showActions && (
              <div className={cn(
                "absolute -top-3 opacity-100 transition-all duration-200 z-10",
                isOwn ? "-left-3" : "-right-3"
              )}>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-2 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReact?.(message.id, '❤️')}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:scale-110 transition-all"
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReactions(!showReactions)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-yellow-500 dark:text-slate-400 dark:hover:text-yellow-400 hover:scale-110 transition-all"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onReply?.(message.id)}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:scale-110 transition-all"
                  >
                    <Reply className="h-3 w-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-6 w-6 p-0 text-slate-500 hover:text-green-600 dark:text-slate-400 dark:hover:text-green-400 hover:scale-110 transition-all"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  {isOwn && onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(message.id)}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:scale-110 transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Reactions Panel */}
            {showReactions && (
              <div className={cn(
                "absolute top-full mt-2 z-20",
                isOwn ? "right-0" : "left-0"
              )}>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl px-3 py-2">
                  {['👍', '❤️', '😊', '😮', '😢', '🔥'].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onReact?.(message.id, emoji);
                        setShowReactions(false);
                      }}
                      className="h-8 w-8 p-0 text-base hover:scale-125 transition-transform hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
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
