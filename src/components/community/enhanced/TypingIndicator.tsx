
import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  users: string[];
  maxVisible?: number;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  users,
  maxVisible = 3,
  className = ''
}) => {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  const getText = () => {
    if (users.length === 1) {
      return `${visibleUsers[0]} is typing...`;
    } else if (users.length === 2) {
      return `${visibleUsers[0]} and ${visibleUsers[1]} are typing...`;
    } else if (users.length <= maxVisible) {
      const lastUser = visibleUsers.pop();
      return `${visibleUsers.join(', ')} and ${lastUser} are typing...`;
    } else {
      return `${visibleUsers.join(', ')} and ${remainingCount} others are typing...`;
    }
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50",
      className
    )}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="italic">{getText()}</span>
    </div>
  );
};
