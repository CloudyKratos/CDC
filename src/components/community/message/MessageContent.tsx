
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Copy, Reply, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';

interface MessageContentProps {
  message: Message;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  message,
  onDelete,
  onReply
}) => {
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();

  const sender = message.sender || {
    id: message.sender_id,
    username: 'Unknown User',
    full_name: 'Unknown User',
    avatar_url: null
  };

  const isOwn = message.sender_id === user?.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div 
      className="group px-4 py-2 hover:bg-muted/30 transition-colors duration-150"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={sender.avatar_url || ''} alt={sender.full_name || sender.username} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {(sender.full_name || sender.username || 'U')[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">
              {sender.full_name || sender.username || 'Unknown User'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.created_at)}
            </span>
            {isOwn && (
              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                You
              </span>
            )}
          </div>

          <div className="text-sm text-foreground leading-relaxed break-words">
            {message.content}
          </div>
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-start opacity-100 transition-opacity">
            <div className="flex items-center gap-1 bg-background border border-border rounded-md p-1 shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(message.id)}
                className="h-6 w-6 p-0 hover:bg-muted"
                title="Reply"
              >
                <Reply className="h-3 w-3" />
              </Button>

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
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy message
                  </DropdownMenuItem>
                  {isOwn && onDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(message.id)}
                      className="text-destructive focus:text-destructive"
                    >
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
