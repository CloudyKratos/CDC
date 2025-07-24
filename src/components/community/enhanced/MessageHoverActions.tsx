
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Heart, MoreHorizontal, Pin, Flag, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MessageHoverActionsProps {
  messageId: string;
  isOwnMessage: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const MessageHoverActions: React.FC<MessageHoverActionsProps> = ({
  messageId,
  isOwnMessage,
  onReply,
  onReact,
  onPin,
  onDelete,
  onReport
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleQuickReaction = (emoji: string) => {
    onReact?.(messageId, emoji);
    setShowReactions(false);
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background border border-border rounded-lg shadow-lg p-1">
      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReply?.(messageId)}
        className="h-8 w-8 p-0 hover:bg-muted"
        title="Reply"
      >
        <Reply className="h-4 w-4" />
      </Button>

      {/* Reaction Button */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="Add reaction"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                onClick={() => handleQuickReaction(emoji)}
                className="h-8 w-8 p-0 text-base hover:bg-muted"
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-muted"
            title="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onPin?.(messageId)}>
            <Pin className="h-4 w-4 mr-2" />
            Pin Message
          </DropdownMenuItem>
          
          {!isOwnMessage && (
            <DropdownMenuItem onClick={() => onReport?.(messageId)}>
              <Flag className="h-4 w-4 mr-2" />
              Report Message
            </DropdownMenuItem>
          )}
          
          {isOwnMessage && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete?.(messageId)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
