
import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  typingUsers: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className = ""
}) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers.length - 2} others are typing...`;
    }
  };

  return (
    <div className={cn("px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50", className)}>
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="italic">{getTypingText()}</span>
      </div>
    </div>
  );
};
