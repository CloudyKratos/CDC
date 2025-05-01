
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface MessageReactionsProps {
  reactions: Record<string, number>;
  onReactionClick: (reaction: string) => void;
  maxDisplay?: number;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onReactionClick,
  maxDisplay = 5
}) => {
  const sortedReactions = Object.entries(reactions)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);
  
  const displayReactions = sortedReactions.slice(0, maxDisplay);
  const remainingCount = sortedReactions.length > maxDisplay 
    ? sortedReactions.slice(maxDisplay).reduce((sum, [_, count]) => sum + count, 0) 
    : 0;
  
  if (displayReactions.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {displayReactions.map(([emoji, count]) => (
        <Badge 
          key={emoji} 
          variant="outline" 
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-xs py-0.5"
          onClick={() => onReactionClick(emoji)}
        >
          {emoji} {count}
        </Badge>
      ))}
      
      {remainingCount > 0 && (
        <Badge
          variant="outline"
          className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer text-xs py-0.5"
        >
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
};

export default MessageReactions;
