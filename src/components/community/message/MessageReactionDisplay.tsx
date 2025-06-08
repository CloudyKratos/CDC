
import React from 'react';
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

interface MessageReactionDisplayProps {
  reactions: Record<string, number>;
  onReactionClick: (reaction: string) => void;
  onAddReaction: () => void;
}

const MessageReactionDisplay: React.FC<MessageReactionDisplayProps> = ({
  reactions,
  onReactionClick,
  onAddReaction
}) => {
  const visibleReactions = Object.entries(reactions).filter(([_, count]) => count > 0);
  
  if (visibleReactions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 ml-16">
      {visibleReactions.map(([emoji, count]) => (
        <Button
          key={emoji} 
          variant="outline" 
          size="sm"
          className="h-8 px-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm transition-all duration-200 hover:scale-105"
          onClick={() => onReactionClick(emoji)}
        >
          <span className="mr-2 text-sm">{emoji}</span>
          <span className="text-xs font-semibold">{count}</span>
        </Button>
      ))}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
        onClick={onAddReaction}
      >
        <Smile size={14} />
      </Button>
    </div>
  );
};

export default MessageReactionDisplay;
