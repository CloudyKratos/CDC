
import React, { useState, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreHorizontal, 
  Reply, 
  Trash2, 
  Copy,
  Flag,
  Heart,
  ThumbsUp,
  Smile
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

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
  showAvatar = true,
  isConsecutive = false,
  hideActions = false,
  isConnected = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied');
    } catch (error) {
      toast.error('Failed to copy message');
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
  };

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

  const handleReport = () => {
    toast.info('Report functionality coming soon');
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 24) {
        return format(date, 'h:mm a');
      }
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'now';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = message.sender?.full_name || message.sender?.username || 'Unknown User';

  return (
    <div
      ref={messageRef}
      className={`group relative flex items-start gap-3 px-4 py-2 hover:bg-muted/30 transition-colors duration-150 ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar Column */}
      <div className="flex-shrink-0 mt-1">
        {showAvatar && !isConsecutive ? (
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={message.sender?.avatar_url || undefined} 
              alt={displayName}
            />
            <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Message Header */}
        {!isConsecutive && (
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-sm text-foreground">
              {displayName}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                You
              </span>
            )}
          </div>
        )}

        {/* Message Text */}
        <div className="text-sm text-foreground leading-relaxed break-words pr-12">
          {message.content}
        </div>
      </div>

      {/* Action Buttons */}
      {!hideActions && showActions && isConnected && (
        <div className="absolute right-4 top-2 flex items-center gap-1 bg-background border border-border rounded-md shadow-sm">
          {/* Quick reactions */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => handleReact('👍')}
          >
            <ThumbsUp className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={() => handleReact('❤️')}
          >
            <Heart className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
            onClick={handleReply}
          >
            <Reply className="h-3 w-3" />
          </Button>

          {/* More options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="h-3 w-3 mr-2" />
                Copy
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleReact('😀')}>
                <Smile className="h-3 w-3 mr-2" />
                React
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {isOwn ? (
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={handleReport}
                  className="text-destructive focus:text-destructive"
                >
                  <Flag className="h-3 w-3 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
