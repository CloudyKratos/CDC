
import React, { useState, useEffect } from 'react';
import { Hash } from "lucide-react";

interface TypingIndicatorProps {
  channelName: string;
  isTyping: boolean;
  typingUsers?: string[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  channelName,
  isTyping,
  typingUsers = []
}) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isTyping && typingUsers.length === 0) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping, typingUsers.length]);

  const getChannelDisplayName = () => {
    return channelName.replace(/-/g, ' ');
  };

  const getTypingText = () => {
    if (isTyping) {
      return `You are typing${dots}`;
    }
    
    if (typingUsers.length === 1) {
      return `${typingUsers[0]} is typing${dots}`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing${dots}`;
    } else if (typingUsers.length > 2) {
      return `${typingUsers.slice(0, 2).join(', ')} and ${typingUsers.length - 2} others are typing${dots}`;
    }
    
    return null;
  };

  const typingText = getTypingText();

  return (
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-4">
        {typingText && (
          <span className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-pulse">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            {typingText}
          </span>
        )}
        <span className="flex items-center gap-2">
          <Hash size={12} />
          {getChannelDisplayName()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Shift + Enter for new line</span>
      </div>
    </div>
  );
};

export default TypingIndicator;
