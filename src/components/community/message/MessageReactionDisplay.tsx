
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

interface MessageReactionDisplayProps {
  reactions: Record<string, number>;
  onReactionClick: (reaction: string) => void;
  onAddReaction: () => void;
  isOwnMessage?: boolean;
}

const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  onReactionClick,
  onAddReaction,
  isOwnMessage = false
}) => {
  const hasReactions = Object.values(reactions).some(count => count > 0);

  if (!hasReactions) return null;

  return (
    <div className={`flex flex-wrap gap-1 mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {Object.entries(reactions).map(([emoji, count]) => (
        count > 0 && (
          <Button
            key={emoji}
            variant="outline"
            size="sm"
            className="h-7 px-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-full text-xs transition-all duration-200 hover:scale-105"
            onClick={() => onReactionClick(emoji)}
          >
            <span className="mr-1">{emoji}</span>
            <span className="text-gray-600 dark:text-gray-400 font-medium">{count}</span>
          </Button>
        )
      ))}
      
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 rounded-full transition-all duration-200 hover:scale-105"
        onClick={onAddReaction}
      >
        <Plus size={12} className="text-gray-500 dark:text-gray-400" />
      </Button>
    </div>
  );
};

export default MessageReactionDisplay;
