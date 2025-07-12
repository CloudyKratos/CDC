
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  onReconnect?: () => void;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  error,
  onReconnect
}) => {
  const { user } = useAuth();

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="mb-2">{error}</div>
            {onReconnect && (
              <Button onClick={onReconnect} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3 text-blue-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {message.sender.full_name?.[0] || message.sender.username?.[0] || '?'}
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
          ))
        )}
      </div>
    </ScrollArea>
  );
};

export default MessagesList;
