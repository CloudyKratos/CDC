
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Trash2, 
  Reply, 
  Heart, 
  ThumbsUp, 
  Laugh,
  Copy,
  Pin
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, reaction: string) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
}

export const ModernMessageBubble: React.FC<ModernMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onReply,
  onReact,
  showAvatar = true,
  isConsecutive = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const senderName = message.sender?.full_name || 
                   message.sender?.username || 
                   'Unknown User';

  const reactions = [
    { emoji: '❤️', label: 'Love', icon: Heart },
    { emoji: '👍', label: 'Like', icon: ThumbsUp },
    { emoji: '😂', label: 'Laugh', icon: Laugh }
  ];

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <div
      className={`group flex items-start gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
        isOwn ? 'flex-row-reverse' : ''
      } ${isConsecutive ? 'mt-0.5' : 'mt-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0">
        {showAvatar && !isConsecutive ? (
          <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-gray-800 shadow-sm">
            <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {senderName[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center">
            {isHovered && (
              <span className="text-xs theme-text-muted">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true }).replace('about ', '')}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        {/* Header */}
        {!isConsecutive && (
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
            <span className="text-sm font-semibold theme-text-primary">
              {isOwn ? 'You' : senderName}
            </span>
            <span className="text-xs theme-text-muted">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        )}
        
        {/* Message Bubble */}
        <div className={`flex items-start gap-2 ${isOwn ? 'justify-end' : ''}`}>
          <div
            className={`relative px-4 py-2 rounded-2xl max-w-md break-words shadow-sm ${
              isOwn
                ? 'bg-blue-500 dark:bg-accent text-white rounded-br-md'
                : 'bg-white dark:bg-gray-700 theme-text-primary border border-gray-200 dark:border-gray-600 rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>
            
            {/* Message tail */}
            <div className={`absolute bottom-0 w-4 h-4 ${
              isOwn 
                ? '-right-2 bg-blue-500 dark:bg-accent' 
                : '-left-2 bg-white dark:bg-gray-700 border-l border-b border-gray-200 dark:border-gray-600'
            } rotate-45 transform origin-bottom-left`} />
          </div>

          {/* Quick Actions */}
          {(isHovered || isOwn) && (
            <div className={`flex items-center gap-1 ${isOwn ? 'order-first' : ''}`}>
              {/* Quick Reactions */}
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {reactions.map((reaction) => (
                  <Button
                    key={reaction.emoji}
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                    onClick={() => onReact?.(message.id, reaction.emoji)}
                  >
                    <span className="text-sm">{reaction.emoji}</span>
                  </Button>
                ))}
              </div>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-40">
                  <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pin className="h-4 w-4 mr-2" />
                    Pin
                  </DropdownMenuItem>
                  {isOwn && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
