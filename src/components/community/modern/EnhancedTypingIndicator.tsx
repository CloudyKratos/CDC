
import React from 'react';
import { User } from '@/types/chat';

interface EnhancedTypingIndicatorProps {
  typingUsers: User[];
  className?: string;
}

export const EnhancedTypingIndicator: React.FC<EnhancedTypingIndicatorProps> = ({
  typingUsers,
  className = ''
}) => {
  if (typingUsers.length === 0) return null;

  const renderTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].full_name || typingUsers[0].username || 'Someone'} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].full_name || typingUsers[0].username} and ${typingUsers[1].full_name || typingUsers[1].username} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <div className={`px-6 py-3 border-t bg-gray-50/50 dark:bg-gray-800/50 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-gray-700 dark:text-gray-300">
          {renderTypingText()}...
        </span>
      </div>
    </div>
  );
};
