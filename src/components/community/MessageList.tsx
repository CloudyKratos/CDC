
import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  activeChannel?: string;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => Promise<void>;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  activeChannel = 'general',
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Welcome to #{activeChannel}
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Be the first to start the conversation!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => (
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
      ))}
    </div>
  );
};

export default MessageList;
