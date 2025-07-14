
import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
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
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      toast.success('Message copied to clipboard');
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
    if (onReport) {
      onReport(message.id);
    } else {
      toast.info('Report functionality coming soon');
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'just now';
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
      className={`group relative px-3 py-2 hover:bg-muted/30 transition-colors duration-200 rounded-lg ${className}`}
      onMouseEnter={() => {
        setIsHovered(true);
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        {showAvatar && !isConsecutive && (
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url || undefined} 
                alt={displayName}
              />
              <AvatarFallback className="text-xs font-medium bg-muted text-muted-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Spacer for consecutive messages */}
        {isConsecutive && <div className="w-8 flex-shrink-0" />}

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header with name and timestamp */}
          {!isConsecutive && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-medium text-foreground text-sm">
                {displayName}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {isOwn && (
                <span className="text-xs text-primary font-medium">
                  You
                </span>
              )}
            </div>
          )}

          {/* Message text */}
          <div className="bg-background rounded-lg px-3 py-2 border border-border/50">
            <div className="text-foreground text-sm leading-relaxed break-words">
              {message.content}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!hideActions && showActions && isConnected && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background rounded-lg p-1 border border-border shadow-sm">
            {/* Quick reactions */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => handleReact('👍')}
            >
              <ThumbsUp className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted"
              onClick={() => handleReact('❤️')}
            >
              <Heart className="h-3 w-3" />
            </Button>

            {/* More options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleReply}>
                  <Reply className="h-3 w-3 mr-2" />
                  Reply
                </DropdownMenuItem>
                
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
    </div>
  );
};
