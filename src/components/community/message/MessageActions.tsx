
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  MoreHorizontal, 
  Reply, 
  Pin, 
  Trash2, 
  Copy,
  Flag,
  Smile
} from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  showActions: boolean;
  showReactions: boolean;
  setShowReactions: (show: boolean) => void;
  onReply?: (messageId: string) => void;
  onDelete?: () => void;
  onReaction?: (messageId: string, reaction: string) => void;
  isOwnMessage: boolean;
}

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  messageContent,
  showActions,
  showReactions,
  setShowReactions,
  onReply,
  onDelete,
  onReaction,
  isOwnMessage
}) => {
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageContent);
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <>
      {/* Quick Action Buttons */}
      <div className={`absolute top-0 ${isOwnMessage ? 'left-0' : 'right-0'} transform -translate-y-1/2 transition-opacity duration-200 ${
        showActions ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}>
        <div className="flex items-center space-x-1 bg-background border rounded-lg shadow-lg p-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowReactions(!showReactions)}
                >
                  <Smile className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add reaction</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {onReply && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onReply(messageId)}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopyMessage}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                Pin Message
              </DropdownMenuItem>
              
              {!isOwnMessage && (
                <DropdownMenuItem className="text-red-600">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
              
              {isOwnMessage && onDelete && (
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reaction Picker */}
      {showReactions && (
        <div className={`absolute top-full ${isOwnMessage ? 'left-0' : 'right-0'} mt-2 z-10`}>
          <div className="flex items-center space-x-1 bg-background border rounded-lg shadow-lg p-2">
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-accent"
                onClick={() => {
                  onReaction?.(messageId, emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageActions;
