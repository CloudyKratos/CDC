
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnhancedModernMessageBubble } from './modern/EnhancedModernMessageBubble';
import { ModernMessageInput } from './modern/ModernMessageInput';
import { Hash, Bell, Sun, Wifi, WifiOff, Loader2, MessageSquare, Sparkles } from 'lucide-react';

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
        headerGradient: 'from-blue-50 via-blue-100 to-blue-50 dark:from-blue-950/40 dark:via-blue-900/30 dark:to-blue-950/40',
        accent: 'text-blue-600 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
        emptyIcon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
        pattern: 'bg-blue-50/50 dark:bg-blue-950/20'
      };
    case 'morning journey':
      return {
        headerGradient: 'from-orange-50 via-orange-100 to-orange-50 dark:from-orange-950/40 dark:via-orange-900/30 dark:to-orange-950/40',
        accent: 'text-orange-600 dark:text-orange-400',
        badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
        emptyIcon: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
        pattern: 'bg-orange-50/50 dark:bg-orange-950/20'
      };
    case 'general':
    default:
      return {
        headerGradient: 'from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900',
        accent: 'text-gray-600 dark:text-gray-400',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
        emptyIcon: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        pattern: 'bg-gray-50/50 dark:bg-gray-950/20'
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
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Enhanced Header with decorative pattern */}
      <div className={`bg-gradient-to-r ${theme.headerGradient} border-b border-gray-200 dark:border-gray-700 relative overflow-hidden`}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white dark:bg-gray-800 rounded-full -translate-x-16 -translate-y-16 opacity-20" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-white dark:bg-gray-800 rounded-full translate-x-12 translate-y-12 opacity-20" />
        </div>
        
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${theme.badge} shadow-lg`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme.accent} capitalize`}>
                  {activeChannel}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {getChannelDescription(activeChannel)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge 
                variant={isConnected ? "default" : "secondary"}
                className={`flex items-center gap-2 px-3 py-1 ${isConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
              >
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    <span className="font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    <span className="font-medium">Offline</span>
                  </>
                )}
              </Badge>
              
              <Badge variant="outline" className="text-xs font-medium border-current">
                {messages.length} {messages.length === 1 ? 'message' : 'messages'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {!isConnected && user && !error && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-3">
          <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" />
              <span className="font-medium">Connecting to real-time chat...</span>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-4 min-h-full flex flex-col">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm font-medium">Loading conversation...</span>
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
                <div 
                  key={message.id}
                  className="animate-fade-in"
                >
                  <EnhancedModernMessageBubble
                    message={message}
                    isOwn={message.sender_id === user?.id}
                    onDelete={onDeleteMessage}
                    showAvatar={!isConsecutive}
                    isConsecutive={isConsecutive}
                    isConnected={isConnected}
                  />
                </div>
              );
            })}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ${theme.emptyIcon}`}>
                    <MessageSquare className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Welcome to #{activeChannel}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                    {getChannelDescription(activeChannel)}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4" />
                    <span>Be the first to start the conversation!</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Scroll gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 pointer-events-none" />
      </div>

      {/* Enhanced Message Input */}
      <div className={`border-t border-gray-200 dark:border-gray-700 p-6 ${theme.pattern}`}>
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
      return 'Start your day with motivation, routines, and positive energy';
    case 'announcement':
      return 'Important announcements, updates, and community news';
    case 'general':
    default:
      return 'General discussion and community conversations';
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
