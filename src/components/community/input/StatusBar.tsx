
import React from 'react';
import { Hash } from "lucide-react";

interface StatusBarProps {
  isTyping: boolean;
  channelName: string;
  messageLength: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  isTyping, 
  channelName, 
  messageLength 
}) => {
  const getChannelDisplayName = () => {
    return channelName.replace(/-/g, ' ');
  };

  return (
    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-4">
        {isTyping && (
          <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            Typing...
          </span>
        )}
        <span className="flex items-center gap-2">
          <Hash size={12} />
          {getChannelDisplayName()}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Shift + Enter for new line</span>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          {messageLength > 0 ? `${messageLength}/2000` : 'Start typing...'}
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
