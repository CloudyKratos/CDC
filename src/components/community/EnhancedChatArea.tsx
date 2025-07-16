
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { EnhancedModernMessageBubble } from './modern/EnhancedModernMessageBubble';
import { ModernMessageInput } from './modern/ModernMessageInput';
import { EnhancedChatHeader } from './modern/EnhancedChatHeader';
import { EnhancedTypingIndicator } from './modern/EnhancedTypingIndicator';
import { EnhancedConnectionStatus } from './modern/EnhancedConnectionStatus';
import { Loader2, AlertCircle, Users, MessageSquare, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EnhancedChatAreaProps {
  activeChannel: string;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error?: string | null;
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  channelsLoading?: boolean;
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  activeChannel,
  messages,
  isLoading,
  isConnected,
  error,
  onSendMessage,
  onDeleteMessage,
  channelsLoading = false
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !isConnected) {
      if (!isConnected) {
        toast.error("Cannot send message while offline");
      }
      return;
    }

    setIsSending(true);
    try {
      const success = await onSendMessage(messageText.trim());
      if (success) {
        setMessageText('');
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
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
    // TODO: Implement typing indicator logic
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await onDeleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  };

  const getChannelDescription = () => {
    switch (activeChannel) {
      case 'morning journey':
        return 'Start your day with motivation and morning routines 🌅';
      case 'announcement':
        return 'Important announcements and updates 📢';
      case 'general':
      default:
        return 'General discussion and community chat 💬';
    }
  };

  const reconnect = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Enhanced Header */}
      <EnhancedChatHeader
        channelName={activeChannel}
        messageCount={messages.length}
        onlineUsers={1} // TODO: Implement actual online user count
        isConnected={isConnected}
        isLoading={isLoading || channelsLoading}
        onReconnect={reconnect}
      />

      {/* Connection Status */}
      <div className="px-6 py-2 border-b bg-gray-50/50 dark:bg-gray-800/50">
        <EnhancedConnectionStatus
          isConnected={isConnected}
          isLoading={isLoading || channelsLoading}
          error={error}
          onReconnect={reconnect}
          connectionHealth={isConnected ? 'excellent' : 'poor'}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {/* Channel Welcome Message */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 capitalize">
                  Welcome to #{activeChannel}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                  {getChannelDescription()}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>Be the first to start the conversation!</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Loading messages...
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connecting to #{activeChannel}
                    </p>
                  </div>
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
                  isOwn={message.sender_id === user?.id}
                  onDelete={handleDeleteMessage}
                  showAvatar={!isConsecutive}
                  isConsecutive={isConsecutive}
                  isConnected={isConnected}
                />
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Typing Indicator */}
      <EnhancedTypingIndicator typingUsers={typingUsers} />

      {/* Message Input */}
      <div className="flex-shrink-0 border-t bg-white dark:bg-gray-900">
        <ModernMessageInput
          value={messageText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isConnected || isSending}
          isLoading={isSending}
          placeholder={
            !isConnected 
              ? "Reconnecting..." 
              : `Message #${activeChannel}...`
          }
        />
      </div>
    </div>
  );
};
