import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Edit, Trash2, Reply, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';

interface MessageActionsProps {
  message: Message;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  onEdit,
  onDelete,
  onReply,
  onReact
}) => {
  const { user } = useAuth();
  const isOwn = message.sender_id === user?.id;

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onReact && (
          <DropdownMenuItem onClick={() => onReact(message.id, '❤️')}>
            <Heart className="mr-2 h-4 w-4" />
            React
          </DropdownMenuItem>
        )}
        
        {onReply && (
          <DropdownMenuItem onClick={() => onReply(message.id)}>
            <Reply className="mr-2 h-4 w-4" />
            Reply
          </DropdownMenuItem>
        )}
        
        {isOwn && (
          <>
            <DropdownMenuSeparator />
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(message.id)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={() => onDelete(message.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;