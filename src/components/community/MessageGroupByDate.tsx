
import React from 'react';
import { Message } from '@/types/chat';
import MessageItem from './MessageItem';

interface MessageGroupByDateProps {
  date: string;
  messages: Message[];
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => Promise<void>;
}

const MessageGroupByDate: React.FC<MessageGroupByDateProps> = ({
  date,
  messages,
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd
}) => {
  const formatDateHeader = (dateString: string) => {
    const messageDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div>
      {/* Date separator */}
      <div className="flex items-center justify-center my-6 px-4">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {formatDateHeader(date)}
          </span>
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
      </div>
      
      {/* Messages for this date */}
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            onDeleteMessage={onDeleteMessage}
            onReplyMessage={onReplyMessage}
            onReactionAdd={onReactionAdd}
          />
        ))}
      </div>
    </div>
  );
};

export default MessageGroupByDate;
