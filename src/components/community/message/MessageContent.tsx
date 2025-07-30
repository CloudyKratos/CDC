
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
      <div className={`relative max-w-full transition-all duration-200 ${
        isOwnMessage 
          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm' 
          : 'bg-muted/50 text-foreground rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-border/30'
      } hover:shadow-md`}>
        <p className={`whitespace-pre-line break-words text-sm leading-relaxed`}>
          {content}
        </p>
        
        {showTimestamp && isOwnMessage && (
          <div className="text-xs text-primary-foreground/70 mt-1.5 flex items-center justify-end gap-1">
            <span>{formattedTime}</span>
            <div className="flex">
              <div className="w-1 h-1 bg-primary-foreground/50 rounded-full"></div>
              <div className="w-1 h-1 bg-primary-foreground/70 rounded-full ml-0.5"></div>
            </div>
          </div>
        )}
      </div>
      
      {showTimestamp && !isOwnMessage && (
        <span className="text-xs text-muted-foreground ml-3 opacity-0 group-hover/content:opacity-100 transition-opacity self-end mb-1">
          {formattedTime}
        </span>
      )}
    </div>
  );
};

export default MessageContent;
