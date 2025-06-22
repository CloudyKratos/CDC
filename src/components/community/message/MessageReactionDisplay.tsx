
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MessageReactionDisplayProps {
  reactions: Record<string, number>;
  onReactionClick: (reaction: string) => void;
  onAddReaction: () => void;
  isOwnMessage: boolean;
}

const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  onReactionClick,
  onAddReaction,
  isOwnMessage
}) => {
  const hasReactions = Object.keys(reactions).length > 0;

  if (!hasReactions) return null;

  return (
    <div className={`flex items-center space-x-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {Object.entries(reactions).map(([emoji, count]) => (
        <Button
          key={emoji}
          variant="outline"
          size="sm"
          className="h-6 px-2 py-0 text-xs bg-muted/50 hover:bg-muted border-muted-foreground/20"
          onClick={() => onReactionClick(emoji)}
        >
          <span className="mr-1">{emoji}</span>
          <span>{count}</span>
        </Button>
      ))}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
        onClick={onAddReaction}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default MessageReactionDisplay;
