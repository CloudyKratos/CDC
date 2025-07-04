
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleCommunityChat } from '@/hooks/useSimpleCommunityChat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModernChatHeader } from './ModernChatHeader';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { ModernMessageInput } from './ModernMessageInput';
import { TypingIndicator } from './TypingIndicator';
import { 
  Hash, 
  Users, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleCommunityChатProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityChat: React.FC<SimpleCommunityChатProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    users,
    isConnected,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    startTyping,
    reconnect,
    isReady
  } = useSimpleCommunityChat(channelName);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 SimpleCommunityChat Debug:', {
      channelName,
      user: user?.id,
      messagesCount: messages.length,
      isConnected,
      isLoading,
      isReady,
      error
    });
  }, [channelName, user?.id, messages.length, isConnected, isLoading, isReady, error]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected || !isReady) {
      console.log('⚠️ Cannot send message:', { 
        hasText: !!messageText.trim(), 
        isConnected, 
        isReady 
      });
      return;
    }

    const success = await sendMessage(messageText.trim());
    if (success) {
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setMessageText(value);
    startTyping();
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className}`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="h-8 w-8 text-blue-600 dark:text-accent" />
            </div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              Join the Community
            </h3>
            <p className="theme-text-secondary mb-4">
              Sign in to participate in real-time discussions and connect with the community.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
              <Users className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Connection status indicator
  const getConnectionStatus = () => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Connecting...</span>
        </div>
      );
    }
    
    if (isConnected && isReady) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <Wifi className="h-4 w-4" />
          <span className="text-sm">Live</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm">Offline</span>
      </div>
    );
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-blue-600 dark:text-accent" />
            <h2 className="text-lg font-semibold theme-text-primary">
              {channelName}
            </h2>
            <span className="text-sm theme-text-muted">
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
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50 dark:bg-red-900/20 flex-shrink-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
              className="ml-2 h-auto p-1"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-800">
        <div className="p-4 space-y-4">
          {/* Loading State */}
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-blue-600 dark:text-accent">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-sm">Loading messages...</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const isConsecutive = prevMessage && 
              prevMessage.sender_id === message.sender_id &&
              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000;

            return (
              <EnhancedModernMessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === user.id}
                onDelete={handleDeleteMessage}
                showAvatar={!isConsecutive}
                isConsecutive={isConsecutive}
                isConnected={isConnected}
              />
            );
          })}

          {/* Empty State */}
          {!isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-accent" />
                </div>
                <h3 className="text-lg font-semibold theme-text-primary mb-2">
                  Welcome to #{channelName}
                </h3>
                <p className="text-sm theme-text-muted">
                  No messages yet. Start the conversation and connect with the community!
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t">
        <ModernMessageInput
          value={messageText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || !isReady}
          placeholder={
            !isConnected 
              ? "Reconnecting..." 
              : !isReady
              ? "Initializing..."
              : `Message #${channelName}...`
          }
        />
      </div>
    </Card>
  );
};
