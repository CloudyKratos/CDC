
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useUnifiedCommunityChat } from '@/hooks/useUnifiedCommunityChat';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface OptimizedModernCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const OptimizedModernCommunityChat: React.FC<OptimizedModernCommunityChatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    users,
    typingUsers,
    isConnected,
    isReady,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    reconnect,
    connectionAttempts
  } = useUnifiedCommunityChat({ channelName });

  // Stub properties that were expected but don't exist
  const hasMoreMessages = false;
  const unreadCount = 0;
  
  const loadMoreMessages = async () => {
    console.log('Load more messages - not implemented');
  };

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected) return;

    const success = await sendMessage(messageText.trim());
    if (success) {
      setMessageText('');
    }
  };

  if (!user) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Please sign in to join the chat
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardContent className="flex-1 p-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Chat: #{channelName}</h3>
          <p className="text-sm text-gray-600">
            Connected: {isConnected ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-gray-600">
            Messages: {messages.length}
          </p>
          {error && (
            <div className="mt-4 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={reconnect} className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  );
};
