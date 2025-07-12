
import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedCommunityChat } from '@/hooks/useUnifiedCommunityChat';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModernChatHeader } from './ModernChatHeader';
import { ModernMessageInput } from './ModernMessageInput';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModernCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const ModernCommunityChat: React.FC<ModernCommunityChatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    users,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    startTyping,
    clearUnreadCount,
    reconnect,
    isReady,
    connectionHealth,
    diagnostics
  } = useUnifiedCommunityChat({ channelName });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear unread count when component is focused
  useEffect(() => {
    const handleFocus = () => clearUnreadCount();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [clearUnreadCount]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected) return;

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
      {/* Enhanced Header with Connection Status */}
      <div className="flex-shrink-0">
        <ModernChatHeader
          channelName={channelName}
          messageCount={messages.length}
          onlineUsers={users.length}
          isConnected={isConnected}
          isLoading={isLoading}
          onReconnect={reconnect}
        />
        
        {/* Connection Status Bar */}
        <div className="px-4 py-2 border-b bg-gray-50 dark:bg-gray-800/50">
          <ConnectionStatusIndicator
            isConnected={isConnected}
            connectionHealth={connectionHealth === 'unstable' ? 'failed' : connectionHealth}
            isLoading={isLoading}
            onReconnect={reconnect}
            diagnostics={diagnostics}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
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
                  <div className="text-gray-400 dark:text-gray-600 mb-2">
                    💬
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Typing Indicator */}
      <TypingIndicator 
        typingUsers={typingUsers}
        className="flex-shrink-0"
      />

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
              : connectionHealth === 'degraded'
              ? "Limited connectivity - messages may be delayed"
              : `Message #${channelName}...`
          }
        />
      </div>
    </Card>
  );
};
