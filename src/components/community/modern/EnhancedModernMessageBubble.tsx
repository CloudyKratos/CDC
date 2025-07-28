
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Trash2, 
  Pin, 
  Flag,
  Copy,
  Quote
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Message } from '@/types/chat';

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
  isThread?: boolean;
  hideActions?: boolean;
  isConnected?: boolean;
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
  isThread = false,
  hideActions = false,
  isConnected = true,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sender = message.sender || {
    id: message.sender_id,
    username: 'Unknown User',
    full_name: 'Unknown User',
    avatar_url: null
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div 
      className={`group relative px-4 py-2 transition-all duration-200 hover:bg-muted/30 ${
        isConsecutive ? 'mt-1' : 'mt-4'
      } ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isConsecutive && (
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
              <AvatarImage 
                src={sender.avatar_url || ''} 
                alt={sender.full_name || sender.username || 'User'} 
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-sm">
                {(sender.full_name || sender.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col min-w-0 flex-1 ${isConsecutive && showAvatar ? 'ml-11' : ''}`}>
          {/* Header */}
          {!isConsecutive && (
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="font-semibold text-foreground text-sm">
                {sender.full_name || sender.username || 'Unknown User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                <Badge variant="outline" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">
                  You
                </Badge>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative group/message ${isOwn ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`
              relative max-w-[85%] px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200
              ${isOwn 
                ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-br-md' 
                : 'bg-gradient-to-br from-muted/50 to-muted/30 text-foreground border border-border/50 rounded-bl-md'
              }
              ${isHovered ? 'shadow-md' : ''}
            `}>
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {message.content}
              </p>
              
              {/* Timestamp for consecutive messages */}
              {isConsecutive && (
                <div className="absolute -bottom-5 right-2 opacity-0 group-hover/message:opacity-100 transition-opacity">
                  <span className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded-md backdrop-blur-sm">
                    {formatTime(message.created_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {!hideActions && isConnected && (showActions || isHovered) && (
          <div className={`flex items-start mt-1 transition-all duration-200 ${
            showActions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          } ${isOwn ? 'order-first mr-2' : 'order-last ml-2'}`}>
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReact?.(message.id, '❤️')}
                className="h-7 w-7 p-0 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors"
                title="React with heart"
              >
                <Heart className="h-3.5 w-3.5" />
              </Button>

              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message.id)}
                  className="h-7 w-7 p-0 rounded-md hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  title="Reply"
                >
                  <Reply className="h-3.5 w-3.5" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-md hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                    <Quote className="h-4 w-4 mr-2" />
                    Quote reply
                  </DropdownMenuItem>
                  {onPin && (
                    <DropdownMenuItem onClick={() => onPin(message.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      Pin message
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onReport && !isOwn && (
                    <DropdownMenuItem onClick={() => onReport(message.id)} className="text-yellow-600">
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  )}
                  {onDelete && isOwn && (
                    <DropdownMenuItem onClick={() => onDelete(message.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
