
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Trash2, Copy, Reply, Smile } from 'lucide-react';
import { toast } from 'sonner';

interface MessageBubbleProps {
  message: Message;
  showAvatar: boolean;
  isOwn: boolean;
  onDelete: () => void;
  onReply: () => void;
  onReaction: (reaction: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showAvatar,
  isOwn,
  onDelete,
  onReply,
  onReaction
}) => {
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  const senderName = message.sender?.full_name || message.sender?.username || 'Unknown User';
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className={`flex items-start gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded-lg transition-colors ${!showAvatar ? 'ml-12' : ''}`}>
      {/* Avatar */}
      {showAvatar && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage 
            src={message.sender?.avatar_url || ''} 
            alt={senderName} 
          />
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
            {senderInitials}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {senderName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
        )}
        
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
          {message.content}
        </div>
      </div>

      {/* Message Actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopyMessage}>
              <Copy className="h-4 w-4 mr-2" />
              Copy message
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onReply}>
              <Reply className="h-4 w-4 mr-2" />
              Reply
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReaction('👍')}>
              <Smile className="h-4 w-4 mr-2" />
              React
            </DropdownMenuItem>
            {isOwn && (
              <DropdownMenuItem 
                onClick={onDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete message
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MessageBubble;
