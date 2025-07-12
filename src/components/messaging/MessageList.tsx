import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/auth/AuthContext';

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string, content: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd
}) => {
  const { user } = useAuth();

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-400 flex-shrink-0">
              {/* Avatar or Placeholder */}
              {message.sender.avatar_url ? (
                <img
                  src={message.sender.avatar_url}
                  alt={message.sender.full_name || message.sender.username || 'User'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-white text-sm font-semibold">
                  {message.sender.full_name?.[0] || message.sender.username?.[0] || '?'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">
                  {message.sender.full_name || message.sender.username || 'Unknown'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-800 break-words">
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default MessageList;
