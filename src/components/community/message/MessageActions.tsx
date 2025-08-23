import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Reply, MoreHorizontal } from 'lucide-react';

interface MessageActionsProps {
  messageId: string;
  messageContent: string;
  showActions: boolean;
  showReactions: boolean;
  setShowReactions: React.Dispatch<React.SetStateAction<boolean>>;
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
  if (!showActions) return null;

  return (
    <div className="flex items-center gap-1 mt-2">
      {onReaction && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setShowReactions(!showReactions)}
        >
          <Heart className="h-3 w-3 mr-1" />
          React
        </Button>
      )}
      
      {onReply && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => onReply(messageId)}
        >
          <Reply className="h-3 w-3 mr-1" />
          Reply
        </Button>
      )}
      
      {isOwnMessage && onDelete && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          Delete
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2"
      >
        <MoreHorizontal className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default MessageActions;