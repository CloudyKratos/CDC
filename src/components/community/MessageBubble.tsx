
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/auth/AuthContext';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    created_at: string;
    sender: {
      id: string;
      username?: string;
      full_name?: string;
      avatar_url?: string;
    };
  };
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.sender.id;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-200 text-gray-800'
      }`}>
        {!isOwnMessage && (
          <div className="text-xs font-semibold mb-1">
            {message.sender.full_name || message.sender.username}
          </div>
        )}
        <div>{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
