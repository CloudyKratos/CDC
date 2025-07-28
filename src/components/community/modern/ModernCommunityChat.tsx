
import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedCommunityChat } from '@/hooks/useUnifiedCommunityChat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModernChatHeader } from './ModernChatHeader';
import { ModernMessageInput } from './ModernMessageInput';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { TypingIndicator } from './TypingIndicator';
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
  } = useUnifiedCommunityChat(channelName);

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
      <Card className={`h-full bg-gradient-to-br from-background to-muted/20 shadow-xl border-0 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Join the Conversation</h3>
              <p className="text-muted-foreground">
                Please sign in to access the community chat
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className={`h-full flex flex-col bg-gradient-to-br from-background via-background/98 to-muted/10 shadow-2xl border-border/50 overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <ModernChatHeader
          channelName={channelName}
          messageCount={messages.length}
          onlineUsers={users.length}
          isConnected={isConnected}
          isLoading={isLoading}
          onReconnect={reconnect}
        />
      </div>

      {/* Error Alert with enhanced styling */}
      {error && (
        <Alert className="m-4 border-destructive/20 bg-destructive/5 dark:bg-destructive/10 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive/90 font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area with enhanced background */}
      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/5 to-transparent pointer-events-none" />
        <ScrollArea className="h-full relative z-10" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-4 px-6 py-4 bg-muted/30 rounded-2xl backdrop-blur-sm border border-muted/40">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">Loading messages...</span>
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
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Start the Conversation</h3>
                    <p className="text-muted-foreground text-sm max-w-xs">
                      No messages yet. Be the first to share something with the community!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Typing Indicator */}
      <TypingIndicator 
        typingUsers={typingUsers}
        className="flex-shrink-0 relative"
      />

      {/* Enhanced Message Input */}
      <div className="flex-shrink-0 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
        <div className="bg-gradient-to-r from-background/95 via-background to-background/95 backdrop-blur-sm">
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
      </div>
    </Card>
  );
};
