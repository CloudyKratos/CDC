
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnhancedModernMessageBubble } from './modern/EnhancedModernMessageBubble';
import { ModernMessageInput } from './modern/ModernMessageInput';
import { Hash, Bell, Sun, Wifi, WifiOff, Loader2, MessageSquare } from 'lucide-react';

interface EnhancedChatAreaProps {
  activeChannel: string;
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  channelsLoading: boolean;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return Bell;
    case 'morning journey':
      return Sun;
    case 'general':
    default:
      return Hash;
  }
};

const getChannelTheme = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return {
        gradient: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20',
        accent: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      };
    case 'morning journey':
      return {
        gradient: 'from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20',
        accent: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      };
    case 'general':
    default:
      return {
        gradient: 'from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/20',
        accent: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      };
  }
};

export const EnhancedChatArea: React.FC<EnhancedChatAreaProps> = ({
  activeChannel,
  messages,
  isLoading,
  isConnected,
  error,
  onSendMessage,
  onDeleteMessage,
  channelsLoading
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = React.useState('');

  const theme = getChannelTheme(activeChannel);
  const IconComponent = getChannelIcon(activeChannel);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    const success = await onSendMessage(messageText.trim());
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

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
      {/* Enhanced Header */}
      <div className={`bg-gradient-to-r ${theme.gradient} border-b border-gray-200 dark:border-gray-700 p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${theme.badge}`}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <h1 className={`text-xl font-semibold ${theme.accent}`}>
                {activeChannel}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getChannelDescription(activeChannel)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={`flex items-center gap-1 ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  Offline
                </>
              )}
            </Badge>
            
            <Badge variant="outline" className="text-xs">
              {messages.length} messages
            </Badge>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && user && !error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
          <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
            <div className="animate-pulse mr-2">🔄</div>
            Connecting to real-time chat...
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
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
                new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;

              return (
                <EnhancedModernMessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  onDelete={onDeleteMessage}
                  showAvatar={!isConsecutive}
                  isConsecutive={isConsecutive}
                  isConnected={isConnected}
                />
              );
            })}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-sm">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${theme.badge}`}>
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to #{activeChannel}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {getChannelDescription(activeChannel)}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
        <ModernMessageInput
          value={messageText}
          onChange={setMessageText}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : getChannelPlaceholder(activeChannel)
          }
        />
      </div>
    </div>
  );
};

function getChannelDescription(channelName: string): string {
  switch (channelName) {
    case 'morning journey':
      return 'Start your day with motivation and morning routines';
    case 'announcement':
      return 'Important announcements and updates';
    case 'general':
    default:
      return 'General discussion and community chat';
  }
}

function getChannelPlaceholder(channelName: string): string {
  switch (channelName) {
    case 'morning journey':
      return "Share your morning routine or motivation...";
    case 'announcement':
      return "Share important updates...";
    case 'general':
    default:
      return `Message #${channelName}...`;
  }
}
