
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

  const chatHookResult = useSimpleChat(channelName);
  
  // Handle the case where useSimpleChat might return void - provide safe defaults
  const messages = chatHookResult?.messages ?? [];
  const isLoading = chatHookResult?.isLoading ?? false;
  const error = chatHookResult?.error ?? null;
  const isConnected = chatHookResult?.isConnected ?? false;
  const sendMessage = chatHookResult?.sendMessage;
  const deleteMessage = chatHookResult?.deleteMessage;

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
      <Card className={`h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm ${className}`}>
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-12 h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
              Join the conversation
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Sign in to participate in community discussions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-sm ${className}`}>
      {/* Clean Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-900 dark:text-white text-sm">
              #{channelName}
            </span>
          </div>
          
          <Badge 
            variant="outline"
            className={`text-xs border-0 px-2 py-1 ${
              isConnected 
                ? 'text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/50' 
                : 'text-slate-500 bg-slate-50/50 dark:bg-slate-800/50'
            }`}
          >
            {isConnected ? (
              <><Wifi className="h-3 w-3 mr-1.5" />Online</>
            ) : (
              <><WifiOff className="h-3 w-3 mr-1.5" />Offline</>
            )}
          </Badge>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200/50 bg-red-50/50 dark:bg-red-950/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-400 text-sm">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-6 space-y-4">
            {/* Loading State */}
            {isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-slate-500">
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
                  className="transition-all duration-200 ease-in-out"
                />
              );
            })}

            {/* Empty State */}
            {!isLoading && messages.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center max-w-sm">
                  <div className="w-10 h-10 bg-slate-100/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                    No messages yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">
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
      <div className="flex-shrink-0 border-t border-slate-200/50 dark:border-slate-700/50 p-4">
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
