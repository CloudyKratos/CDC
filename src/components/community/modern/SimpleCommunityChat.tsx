
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useSimpleChat } from '../hooks/useSimpleChat';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernMessageInput } from './ModernMessageInput';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { 
  Loader2, 
  AlertCircle, 
  Users, 
  Hash,
  Wifi,
  WifiOff,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityChat: React.FC<SimpleCommunitychatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage
  } = useSimpleChat(channelName);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  if (!user) {
    return (
      <Card className={`h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950 border-0 shadow-2xl ${className}`}>
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Community
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Sign in to participate in real-time discussions and connect with fellow community members.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Sparkles className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-blue-950/30 border-0 shadow-2xl overflow-hidden ${className}`}>
      {/* Enhanced Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Hash className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  #{channelName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Community discussion
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant={isConnected ? "default" : "secondary"}
              className={`flex items-center gap-2 px-3 py-1 transition-all duration-200 ${
                isConnected 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" />
                  <span className="font-medium">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  <span>Connecting...</span>
                </>
              )}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Users className="h-3 w-3" />
              <span>{messages.length > 0 ? 'Active' : 'Quiet'}</span>
            </Badge>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50 dark:bg-red-900/20 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-6">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-lg font-medium">Loading messages...</span>
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
                  className="animate-fade-in"
                />
              );
            })}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    Be the first to share your thoughts in #{channelName}. Your message will help get the discussion started!
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Gradient overlay for better readability */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-900 dark:via-slate-900/80 pointer-events-none" />
      </div>

      {/* Enhanced Message Input */}
      <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <ModernMessageInput
          value={messageText}
          onChange={setMessageText}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          placeholder={
            !isConnected 
              ? "Reconnecting..." 
              : `Share your thoughts in #${channelName}...`
          }
        />
      </div>
    </Card>
  );
};
