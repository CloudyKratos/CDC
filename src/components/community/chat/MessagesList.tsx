
import React, { useRef, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { MessageCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  onReconnect: () => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  error,
  onReconnect
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-3">Connection failed</p>
          <Button onClick={onReconnect} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === user?.id;
        const senderName = message.sender?.full_name || 
                         message.sender?.username || 
                         'Unknown User';
        const avatar = message.sender?.avatar_url;

        return (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={avatar || ''} alt={senderName} />
              <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                {senderName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className={`flex-1 max-w-xs lg:max-w-md ${isOwn ? 'text-right' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {isOwn ? 'You' : senderName}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <div
                className={`inline-block px-3 py-2 rounded-lg ${
                  isOwn
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesList;
