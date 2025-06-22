
import React from 'react';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  isOwnMessage: boolean;
  showTimestamp?: boolean;
  timestamp?: string;
}

const MessageContent: React.FC<MessageContentProps> = ({
  content,
  isOwnMessage,
  showTimestamp = false,
  timestamp
}) => {
  // Simple markdown-like formatting
  const formatContent = (text: string) => {
    // Handle bold **text**
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic *text*
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle code `text`
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Handle mentions @username
    formatted = formatted.replace(/@(\w+)/g, '<span class="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline">@$1</span>');
    
    // Handle line breaks
    formatted = formatted.replace(/\n/g, '<br />');
    
    return formatted;
  };

  return (
    <div className={`group relative ${isOwnMessage ? 'text-right' : ''}`}>
      <div
        className={cn(
          "inline-block px-4 py-2 rounded-2xl text-sm leading-relaxed break-words max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl",
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-muted rounded-bl-md"
        )}
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
      
      {showTimestamp && timestamp && (
        <div className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
          {new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </div>
  );
};

export default MessageContent;
