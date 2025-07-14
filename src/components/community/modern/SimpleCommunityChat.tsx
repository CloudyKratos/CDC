
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
  MessageSquare
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SimpleCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityChat: React.FC<SimpleCommunityChatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatResult = useSimpleChat(channelName);
  
  // Handle the case where useSimpleChat might return void - use optional chaining
  const {
    messages = [],
    isLoading = false,
    error = null,
    isConnected = false,
    sendMessage,
    deleteMessage
  } = chatResult || {};

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected || !sendMessage) return;

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
    if (deleteMessage) {
      await deleteMessage(messageId);
    }
  };

  if (!user) {
    return (
      <Card className={`h-full flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 shadow-none ${className}`}>
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 bg-gray-100/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Join the conversation
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Sign in to participate in community discussions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-0 shadow-none ${className}`}>
      {/* Minimal Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {channelName}
            </span>
          </div>
          
          <Badge 
            variant="outline"
            className={`text-xs border-0 ${
              isConnected 
                ? 'text-green-600 bg-green-50/50 dark:bg-green-950/50' 
                : 'text-gray-500 bg-gray-50/50 dark:bg-gray-800/50'
            }`}
          >
            {isConnected ? (
              <><Wifi className="h-3 w-3 mr-1" />Online</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1" />Offline</>
            )}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-3 border-red-200/50 bg-red-50/50 dark:bg-red-950/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-3">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
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
                  className="transition-opacity duration-200"
                />
              );
            })}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center max-w-sm">
                  <div className="w-8 h-8 bg-gray-100/50 dark:bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-4 w-4 text-gray-400" />
                  </div>
                  <h3 className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Start the conversation in #{channelName}
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-gray-200/50 dark:border-gray-700/50">
        <ModernMessageInput
          value={messageText}
          onChange={setMessageText}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={!isConnected}
          placeholder={
            !isConnected 
              ? "Connecting..." 
              : `Message #${channelName}...`
          }
        />
      </div>
    </Card>
  );
};
