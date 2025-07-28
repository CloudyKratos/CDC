
import React from 'react';
import { MessageCircle } from 'lucide-react';

interface TypingIndicatorProps {
  typingUsers: string[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className = ''
}) => {
  if (typingUsers.length === 0) {
    return null;
  }

  const formatTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else {
      return `${typingUsers.slice(0, -1).join(', ')}, and ${typingUsers[typingUsers.length - 1]} are typing...`;
    }
  };

  return (
    <div className={`px-6 py-3 border-t bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm ${className}`}>
      <div className="flex items-center gap-3 animate-fade-in">
        <div className="flex items-center gap-1">
          <MessageCircle className="h-4 w-4 text-primary" />
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
          </div>
        </div>
        <span className="text-sm text-muted-foreground font-medium">
          {formatTypingText()}
        </span>
      </div>
    </div>
  );
};
