
import React from 'react';
import { Message } from '@/types/chat';

interface MessageItemProps {
  message: Message;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => Promise<void>;
}

const MessageItem: React.FC<MessageItemProps> = ({ 
  message, 
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd
}) => {
  return (
    <div key={message.id} className="flex gap-3">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
        {message.sender?.username?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {message.sender?.full_name || message.sender?.username || 'User'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <p className="text-slate-700 dark:text-slate-300">
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
