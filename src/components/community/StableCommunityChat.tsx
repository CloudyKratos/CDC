
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStableChatConnection } from './hooks/useStableChatConnection';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Hash, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw,
  Loader2,
  Trash2,
  Users
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StableCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const StableCommunityChat: React.FC<StableCommunityChatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isConnected,
    isLoading,
    error,
    messages,
    sendMessage,
    deleteMessage,
    reconnect
  } = useStableChatConnection(channelName);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (inputRef.current && isConnected && !isLoading) {
      inputRef.current.focus();
    }
  }, [isConnected, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !isConnected) {
      return;
    }

    const messageToSend = messageText.trim();
    setMessageText(''); // Clear immediately for better UX
    
    const success = await sendMessage(messageToSend);
    if (!success) {
      // Restore message if sending failed
      setMessageText(messageToSend);
    } else {
      // Focus input after successful send
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isLoading) {
      return (
        <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Loading...
        </Badge>
      );
    }
    
    if (isConnected) {
      return (
        <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
          <Wifi className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
        <WifiOff className="h-3 w-3 mr-1" />
        Disconnected
      </Badge>
    );
  };

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className}`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* Enhanced Header with Stability Indicators */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {channelName}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} messages
            </span>
          </div>
          <div className="flex items-center gap-3">
            {getConnectionStatus()}
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              disabled={isLoading}
              className="h-8 w-8 p-0"
              title="Reconnect"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert with Enhanced Recovery */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50 dark:bg-red-900/20 flex-shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400 flex items-center justify-between">
            <div>
              <div className="font-medium">Connection Issue</div>
              <div className="text-sm">{error}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="ml-2 h-auto p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area with Improved Rendering */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Users className="h-8 w-8 mx-auto mb-2" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = message.sender?.full_name || 
                             message.sender?.username || 
                             'User';
            
            // Group consecutive messages from same sender
            const prevMessage = messages[index - 1];
            const isConsecutive = prevMessage && 
              prevMessage.sender_id === message.sender_id &&
              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;

            return (
              <div key={message.id} className="group">
                <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                  {!isConsecutive && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''} ${isConsecutive ? 'ml-11' : ''}`}>
                    {!isConsecutive && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {isOwn ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <div
                        className={`px-3 py-2 rounded-lg max-w-xs break-words transition-all duration-200 ${
                          isOwn
                            ? 'bg-blue-500 text-white shadow-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>

                      {isOwn && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-6 w-6 p-0 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => handleDeleteMessage(message.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Message Input */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50 dark:bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder={
              isConnected 
                ? `Message #${channelName}...` 
                : isLoading
                ? 'Loading...'
                : 'Connection issues...'
            }
            disabled={!isConnected}
            className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!messageText.trim() || !isConnected}
            size="sm"
            className="px-3 bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        
        {/* Status indicator */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {!isConnected && !isLoading && 'Connection lost - reconnecting automatically...'}
          {isConnected && 'Ready to send messages'}
        </div>
      </div>
    </Card>
  );
};
