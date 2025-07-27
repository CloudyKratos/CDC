
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Message } from '@/types/chat';
import { EnhancedMessageList } from './EnhancedMessageList';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { ChannelHeader } from './enhanced/ChannelHeader';
import { ConnectionIndicator } from './enhanced/ConnectionIndicator';
import { TypingIndicator } from './enhanced/TypingIndicator';

interface EnhancedChatAreaProps {
  activeChannel: string;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error?: string | null;
  channelsLoading?: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => void;
  className?: string;
}

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  activeChannel,
  messages,
  isLoading,
  isConnected,
  error,
  channelsLoading = false,
  onSendMessage,
  onDeleteMessage,
  className = ''
}) => {
  const handleRetry = () => {
    window.location.reload();
  };

  const getChannelDescription = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case 'general':
        return '💬 General community discussions and introductions';
      case 'morning-journey':
      case 'morning journey':
        return '🌅 Start your day with motivation and morning routines';
      case 'announcement':
      case 'announcements':
        return '📢 Important community announcements and updates';
      default:
        return `Discussion channel for ${channelName}`;
    }
  };

  // Error state
  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
        <Alert className="max-w-md border-red-200 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200 space-y-3">
            <div>{error}</div>
            <Button onClick={handleRetry} variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Loading state
  if (isLoading && messages.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Messages...
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Setting up real-time chat for #{activeChannel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* Enhanced Channel Header */}
      <div className="flex-shrink-0">
        <ChannelHeader
          channelName={activeChannel}
          description={getChannelDescription(activeChannel)}
          memberCount={0} // This would come from real data
        />
        
        {/* Connection Status Bar */}
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <ConnectionIndicator
              isConnected={isConnected}
              isReconnecting={channelsLoading}
              onRetry={handleRetry}
            />
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {messages.length} messages
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="p-4">
            <EnhancedMessageList
              messages={messages}
              onDeleteMessage={onDeleteMessage}
              isLoading={isLoading && messages.length > 0}
            />
          </div>
        </ScrollArea>
        
        {/* Typing Indicator */}
        <TypingIndicator users={[]} className="absolute bottom-0 left-0 right-0" />
      </div>

      {/* Enhanced Message Input */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <EnhancedMessageInput
          onSendMessage={onSendMessage}
          disabled={!isConnected || isLoading}
          placeholder={
            !isConnected 
              ? "Disconnected - messages will be sent when connection is restored"
              : `Message #${activeChannel}`
          }
        />
      </div>
    </div>
  );
};
