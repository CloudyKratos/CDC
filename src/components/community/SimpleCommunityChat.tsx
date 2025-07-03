
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleRealtimeChat } from '@/hooks/useSimpleRealtimeChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Hash, 
  Users, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SimpleCommunityChat {
  channelName?: string;
  className?: string;
}

const SimpleCommunityChat: React.FC<SimpleCommunityChat> = ({
  channelName = 'general',
  className = ''
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    deleteMessage,
    reconnect,
    isReady
  } = useSimpleRealtimeChat(channelName);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when ready
  useEffect(() => {
    if (inputRef.current && isReady) {
      inputRef.current.focus();
    }
  }, [isReady]);

  // Handle send message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending || !isReady) {
      return;
    }

    setIsSending(true);
    try {
      const success = await sendMessage(newMessage.trim());
      if (success) {
        setNewMessage('');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, isReady, sendMessage]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await deleteMessage(messageId);
  }, [deleteMessage]);

  // Connection status
  const getConnectionStatus = () => {
    if (isConnected && isReady) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Live</span>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
          <span className="text-sm font-medium">Connecting...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-amber-600">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  };

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <Hash className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state - only show critical errors
  if (error && !isLoading && !isConnected) {
    return (
      <Card className={`h-full ${className} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Connection Error
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button onClick={reconnect} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className} bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}>
      {/* Header */}
      <CardHeader className="flex-none p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {channelName}
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {messages.length} messages
            </span>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionStatus()}
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-900">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
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
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const senderName = message.sender?.full_name || 
                               message.sender?.username || 
                               'Unknown User';

              return (
                <div key={message.id} className="group">
                  <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
                      <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {isOwn ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div
                          className={`px-3 py-2 rounded-lg max-w-xs break-words ${
                            isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
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
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
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
      </CardContent>

      <Separator className="bg-gray-200 dark:bg-gray-700" />

      {/* Message Input */}
      <div className="flex-none p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={
              isReady 
                ? `Message #${channelName}...` 
                : 'Connecting...'
            }
            disabled={!isReady || isSending}
            className="flex-1 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || !isReady || isSending}
            size="sm"
            className="px-3"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default SimpleCommunityChat;
