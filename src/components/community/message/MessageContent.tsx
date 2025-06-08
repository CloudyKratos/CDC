
import React from 'react';
import { format } from 'date-fns';

interface MessageContentProps {
  content: string;
  isOwnMessage?: boolean;
  showTimestamp?: boolean;
  timestamp?: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ 
  content, 
  isOwnMessage = false,
  showTimestamp = false,
  timestamp
}) => {
  const formattedTime = timestamp ? format(new Date(timestamp), 'h:mm a') : '';

  return (
    <div className={`group/content relative ${isOwnMessage ? 'flex justify-end' : ''}`}>
      <div className={`relative max-w-full ${
        isOwnMessage 
          ? 'bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-2 shadow-lg' 
          : 'text-gray-800 dark:text-gray-200'
      }`}>
        <p className={`whitespace-pre-line break-words ${
          isOwnMessage ? 'text-white' : 'text-gray-800 dark:text-gray-200'
        } ${isOwnMessage ? 'text-sm' : 'text-base'} leading-relaxed`}>
          {content}
        </p>
        
        {showTimestamp && isOwnMessage && (
          <div className="text-xs text-blue-100 mt-1 opacity-75">
            {formattedTime}
          </div>
        )}
      </div>
      
      {showTimestamp && !isOwnMessage && (
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 opacity-0 group-hover/content:opacity-100 transition-opacity self-end mb-1">
          {formattedTime}
        </span>
      )}
    </div>
  );
};

export default MessageContent;
