
import React from 'react';
import { Button } from "@/components/ui/button";
import { Reply, MoreHorizontal, Copy, Share, Pin, Flag, Edit3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import MessageReactionPicker from './MessageReactionPicker';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  showActions: boolean;
  showReactions: boolean;
  setShowReactions: (show: boolean) => void;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
  onReaction?: (messageId: string, reaction: string) => void;
  isOwnMessage?: boolean;
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
  isOwnMessage = false
}) => {
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(messageId, reaction);
      toast.success(`Added ${reaction} reaction`);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageContent);
    toast.success('Message copied to clipboard');
  };

  const handleShareMessage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Community Message',
        text: messageContent,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${messageContent}\n\n- Shared from Warrior Community`);
      toast.success('Message link copied to clipboard');
    }
  };

  if (!showActions) return null;

  return (
    <div className={`absolute -top-3 ${isOwnMessage ? 'left-4' : 'right-6'} bg-white dark:bg-gray-800 shadow-xl rounded-xl flex items-center border border-gray-200 dark:border-gray-700 z-10 overflow-hidden`}>
      <MessageReactionPicker
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        onReactionSelect={handleReaction}
      />
      
      <Button
        variant="ghost" 
        size="sm"
        className="h-10 px-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-none"
        onClick={() => onReply?.(messageId)}
      >
        <Reply size={16} />
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-10 px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-none">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => onReply?.(messageId)} className="cursor-pointer">
            <Reply className="mr-3 h-4 w-4" />
            Reply to Message
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyMessage} className="cursor-pointer">
            <Copy className="mr-3 h-4 w-4" />
            Copy Message
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleShareMessage} className="cursor-pointer">
            <Share className="mr-3 h-4 w-4" />
            Share Message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-blue-600">
            <Pin className="mr-3 h-4 w-4" />
            Pin Message
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-amber-600">
            <Flag className="mr-3 h-4 w-4" />
            Report Message
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {isOwnMessage && (
            <>
              <DropdownMenuItem className="text-orange-600 cursor-pointer">
                <Edit3 className="mr-3 h-4 w-4" />
                Edit Message
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 cursor-pointer" onSelect={() => onDelete?.(messageId)}>
                Delete Message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MessageActions;
