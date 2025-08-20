
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Message } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { EnhancedMessageBubble } from './enhanced/EnhancedMessageBubble';
import { IntegratedChatFeatures } from './enhanced/IntegratedChatFeatures';
import { ConnectionIndicator } from './enhanced/ConnectionIndicator';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMessages, setFilteredMessages] = useState(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filter messages based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.sender?.full_name || msg.sender?.username || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMessages(filtered);
    } else {
      setFilteredMessages(messages);
    }
  }, [messages, searchQuery]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (filter: string) => {
    console.log('Filtering by:', filter);
  };

  const handleReply = (messageId: string) => {
    console.log('Replying to message:', messageId);
  };

  const handleReact = (messageId: string, emoji: string) => {
    console.log('Reacting to message:', messageId, 'with:', emoji);
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
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
            Loading Messages...
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Setting up real-time chat for #{activeChannel}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30 ${className}`}>
      {/* Sticky Header with Integrated Features - Mobile optimized */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-gradient-to-r from-blue-200/50 to-purple-200/50 dark:from-blue-800/50 dark:to-purple-800/50 shadow-sm">
        <IntegratedChatFeatures
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchResults={searchQuery ? filteredMessages : []}
          activeUsers={1}
          className="mobile-header-safe" // Add safe area padding
        />
      </div>

      {/* Messages Area - Mobile optimized scrolling with beautiful background */}
      <div className="flex-1 min-h-0 relative overflow-hidden">
        <ScrollArea className="h-full">
          <div className="py-2 sm:py-4 space-y-0 min-h-full bg-gradient-to-b from-transparent via-white/40 to-transparent dark:via-slate-900/40">
            {filteredMessages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 sm:px-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mb-6 shadow-xl animate-pulse">
                  <span className="text-3xl">💬</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  {searchQuery ? 'No messages found' : `Welcome to #${activeChannel}!`}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-base max-w-sm leading-relaxed">
                  {searchQuery ? 'Try a different search term or browse other channels' : 'This is the beginning of your conversation. Send a message to get started!'}
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredMessages.map((message, index) => {
                  const prevMessage = filteredMessages[index - 1];
                  const isOwn = message.sender_id === user?.id;
                  const isConsecutive = prevMessage &&
                    prevMessage.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;
                  
                  return (
                    <div 
                      key={message.id}
                      className="will-change-contents" // Prevent layout shifts
                      style={{ contain: 'layout' }} // Optimize rendering
                    >
                      <EnhancedMessageBubble
                        message={message}
                        isOwn={isOwn}
                        showAvatar={!isConsecutive}
                        isConsecutive={isConsecutive}
                        onReply={handleReply}
                        onReact={handleReact}
                        onDelete={isOwn ? onDeleteMessage : undefined}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            
            {isLoading && filteredMessages.length > 0 && (
              <div className="flex items-center justify-center py-6">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
            
            {/* Scroll anchor for new messages */}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* Fixed Enhanced Message Input - Mobile optimized */}
      <div className="flex-shrink-0 border-t border-gradient-to-r from-blue-200/50 to-purple-200/50 dark:from-blue-800/50 dark:to-purple-800/50 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl sticky bottom-0 z-20 shadow-lg">
        <EnhancedMessageInput
          onSendMessage={onSendMessage}
          disabled={!isConnected || isLoading}
          placeholder={
            !isConnected 
              ? "Reconnecting to chat..."
              : `Message #${activeChannel} channel...`
          }
          className="mobile-input-safe" // Safe area padding for mobile
        />
      </div>
    </div>
  );
};
