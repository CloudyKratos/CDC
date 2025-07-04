
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Hash, 
  Users, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  RefreshCw,
  MoreVertical,
  Trash2,
  Reply
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface ProductionCommunityChatProps {
  channelName?: string;
  className?: string;
}

const ProductionCommunityChat: React.FC<ProductionCommunityChatProps> = ({
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
    onlineUsers,
    sendMessage,
    deleteMessage,
    reconnect,
    isReady,
    userCount
  } = useRealtimeChat(channelName);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when component mounts
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
        // Focus back to input after sending
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } finally {
      setIsSending(false);
    }
  }, [newMessage, isSending, isReady, sendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  }, [handleSendMessage]);

  // Handle delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      toast.success('Message deleted');
    }
  }, [deleteMessage]);

  // Get connection status indicator
  const getConnectionStatus = () => {
    if (isConnected && isReady) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Live</span>
          <Badge variant="secondary" className="text-xs">
            {userCount} online
          </Badge>
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

    if (error) {
      return (
        <div className="flex items-center gap-2 text-red-600">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">Disconnected</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-500">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  };

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className}`}>
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state with retry
  if (error && !isConnected && !isLoading) {
    return (
      <Card className={`h-full ${className}`}>
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
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <CardHeader className="flex-none p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {channelName}
            </h2>
          </div>
          {getConnectionStatus()}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-y-auto p-4 space-y-4">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <p>No messages yet</p>
                <p className="text-sm">Be the first to start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              const senderName = message.sender?.full_name || 
                               message.sender?.username || 
                               'Unknown User';
              const avatar = message.sender?.avatar_url;

              return (
                <div key={message.id} className="group">
                  <div className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={avatar || ''} alt={senderName} />
                      <AvatarFallback className="text-xs">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {isOwn ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <div className="flex items-start gap-2">
                        <div
                          className={`inline-block px-3 py-2 rounded-lg max-w-xs lg:max-w-md break-words ${
                            isOwn
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>

                        {/* Message actions */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Reply className="h-3 w-3" />
                                Reply
                              </DropdownMenuItem>
                              {isOwn && (
                                <DropdownMenuItem 
                                  className="gap-2 text-red-600"
                                  onClick={() => handleDeleteMessage(message.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
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

      <Separator />

      {/* Message Input */}
      <div className="flex-none p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isReady 
                ? `Message #${channelName}...` 
                : 'Connecting...'
            }
            disabled={!isReady || isSending}
            className="flex-1"
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
        
        {/* Character counter */}
        {newMessage.length > 800 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {newMessage.length}/1000
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductionCommunityChat;
