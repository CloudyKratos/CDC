
import React from 'react';
import { useSimpleChatSystem } from '@/hooks/useSimpleChatSystem';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { ModernMessageInput } from './ModernMessageInput';
import { 
  Hash, 
  Users, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  Wifi,
  WifiOff,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

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
    isLoading,
    isConnected,
    error,
    isReady,
    isSending,
    sendMessage,
    deleteMessage,
    reload
  } = useSimpleChatSystem(channelName);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isReady) {
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
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className} bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-blue-950/50 border-0 shadow-2xl`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Join the Community
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              Sign in to participate in real-time discussions and connect with amazing people in our community.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className} bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl overflow-hidden`}>
      {/* Enhanced Header with Connection Status */}
      <div className="flex-shrink-0 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-500/10 dark:from-blue-900/20 dark:via-purple-900/10 dark:to-blue-900/20 border-b border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                {channelName}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {messages.length} messages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Connecting...</span>
                </>
              ) : isConnected ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Live</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <WifiOff className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Offline</span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reload}
              disabled={isLoading}
              className="h-9 w-9 p-0 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200/50 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 flex-shrink-0 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400 flex items-center justify-between">
            <div>
              <div className="font-medium">Connection Issue</div>
              <div className="text-sm">{error}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={reload}
              className="ml-2 h-auto p-2 hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* Loading State */}
          {isLoading && messages.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Loading messages...
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Setting up your chat experience
                </p>
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
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  Welcome to #{channelName}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  No messages yet. Start the conversation and connect with the community!
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/80 via-gray-50/50 to-white/80 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-slate-900/80 backdrop-blur-sm">
        <ModernMessageInput
          value={messageText}
          onChange={handleInputChange}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isReady || isSending}
          placeholder={
            !isReady
              ? "Connecting..."
              : `Message #${channelName}...`
          }
        />
      </div>
    </Card>
  );
};
