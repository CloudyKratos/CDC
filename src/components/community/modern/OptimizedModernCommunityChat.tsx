
import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedCommunityChat } from '@/hooks/useUnifiedCommunityChat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ModernChatHeader } from './ModernChatHeader';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { ModernMessageInput } from './ModernMessageInput';
import { TypingIndicator } from './TypingIndicator';
import { UserListSidebar } from './UserListSidebar';
import { VirtualizedMessageList } from './VirtualizedMessageList';
import { AnnouncementMessage } from './AnnouncementMessage';
import { PollMessage } from './PollMessage';
import { 
  Hash, 
  Users, 
  Loader2, 
  ArrowUp,
  Phone,
  Video,
  Sidebar,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface OptimizedModernCommunityChatProps {
  channelName?: string;
  className?: string;
}

// Memoized message component to prevent unnecessary re-renders
const MemoizedMessageBubble = React.memo(EnhancedModernMessageBubble);

export const OptimizedModernCommunityChat: React.FC<OptimizedModernCommunityChatProps> = ({
  channelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const {
    messages,
    users,
    typingUsers,
    isConnected,
    isLoading,
    error,
    hasMoreMessages,
    unreadCount,
    sendMessage,
    deleteMessage,
    startTyping,
    loadMoreMessages,
    clearUnreadCount,
    reconnect,
    isReady
  } = useUnifiedCommunityChat(channelName);

  // Memoized message processing for performance
  const processedMessages = useMemo(() => {
    return messages.map(message => ({
      ...message,
      reactions: [], // Placeholder for reactions
      replies: [], // Placeholder for replies
      isPinned: false // Placeholder for pinned messages
    }));
  }, [messages]);

  // Enable virtualization for large message lists
  useEffect(() => {
    setUseVirtualization(messages.length > 100);
  }, [messages.length]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto' 
      });
    }
  }, []);

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    setIsNearBottom(isAtBottom);
    setShowScrollToBottom(!isAtBottom && messages.length > 0);

    if (isAtBottom && unreadCount > 0) {
      clearUnreadCount();
    }

    // Load more messages when scrolling to top
    if (container.scrollTop < 100 && hasMoreMessages && !isLoading) {
      loadMoreMessages();
    }
  }, [messages.length, unreadCount, hasMoreMessages, isLoading, clearUnreadCount, loadMoreMessages]);

  // Auto-scroll for new messages
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isNearBottom, scrollToBottom]);

  // Enhanced message handlers
  const handleAddReaction = useCallback(async (messageId: string, emoji: string) => {
    // TODO: Implement reaction functionality
    toast.info('Reactions feature coming soon!');
  }, []);

  const handleRemoveReaction = useCallback(async (messageId: string, emoji: string) => {
    // TODO: Implement reaction removal
    toast.info('Reactions feature coming soon!');
  }, []);

  const handleReplyMessage = useCallback(async (messageId: string) => {
    // TODO: Implement reply functionality
    toast.info('Reply feature coming soon!');
  }, []);

  const handlePinMessage = useCallback(async (messageId: string) => {
    // TODO: Implement pin functionality
    toast.info('Pin message feature coming soon!');
  }, []);

  const handleReportMessage = useCallback(async (messageId: string) => {
    // TODO: Implement report functionality
    toast.info('Report message feature coming soon!');
  }, []);

  const handleSendReply = useCallback(async (content: string, parentId: string): Promise<boolean> => {
    // TODO: Implement thread reply functionality
    toast.info('Thread replies coming soon!');
    return false;
  }, []);

  // Call actions
  const handleStartCall = useCallback(() => {
    toast.info('Voice call feature coming soon!');
  }, []);

  const handleStartVideo = useCallback(() => {
    toast.info('Video call feature coming soon!');
  }, []);

  // Authentication guard
  if (!user) {
    return (
      <Card className={`h-full ${className} theme-card`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="h-8 w-8 text-blue-600 dark:text-accent" />
            </div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              Join the Community
            </h3>
            <p className="theme-text-secondary mb-4">
              Sign in to participate in real-time discussions and connect with the community.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm theme-text-muted">
              <Users className="h-4 w-4" />
              <span>Connect • Chat • Collaborate</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error && !isLoading && !isConnected) {
    return (
      <Card className={`h-full ${className} theme-card`}>
        <div className="h-full flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold theme-text-primary mb-2">
              Connection Error
            </h3>
            <p className="theme-text-secondary mb-4">
              {error}
            </p>
            <Button onClick={reconnect} className="gap-2">
              <ArrowUp className="w-4 h-4" />
              Reconnect
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const onlineUsers = users.filter(u => u.is_online).length;

  return (
    <div className={`h-full flex ${className}`}>
      {/* Main Chat Area */}
      <Card className="flex-1 flex flex-col theme-card shadow-xl border-0 overflow-hidden">
        {/* Header */}
        <ModernChatHeader
          channelName={channelName}
          messageCount={messages.length}
          onlineUsers={onlineUsers}
          isConnected={isConnected}
          isLoading={isLoading}
          onReconnect={reconnect}
          onStartCall={handleStartCall}
          onStartVideo={handleStartVideo}
        />

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          {useVirtualization ? (
            <VirtualizedMessageList
              messages={processedMessages}
              height={600} // Dynamic height would be better
              onDeleteMessage={deleteMessage}
              onReplyMessage={handleReplyMessage}
              onReactionAdd={handleAddReaction}
              currentUserId={user?.id}
            />
          ) : (
            <div
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto bg-gradient-to-b from-gray-50/30 to-white dark:from-gray-900/30 dark:to-gray-800 scrollbar-thin"
            >
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-blue-600 dark:text-accent">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="font-medium">Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center theme-text-muted max-w-md">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-blue-600 dark:text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold theme-text-primary mb-2">
                      Welcome to #{channelName}
                    </h3>
                    <p className="text-sm">
                      No messages yet. Start the conversation and connect with the community!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  {/* Load More Messages */}
                  {hasMoreMessages && (
                    <div className="flex justify-center py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadMoreMessages}
                        disabled={isLoading}
                        className="text-sm theme-text-muted hover:theme-text-primary"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          'Load earlier messages'
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Messages */}
                  {processedMessages.map((message, index) => {
                    const prevMessage = processedMessages[index - 1];
                    const isConsecutive = prevMessage && 
                      prevMessage.sender_id === message.sender_id &&
                      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000;

                    return (
                      <MemoizedMessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === user?.id}
                        onDelete={deleteMessage}
                        onReply={handleReplyMessage}
                        onReact={handleAddReaction}
                        onRemoveReaction={handleRemoveReaction}
                        onPin={handlePinMessage}
                        onReport={handleReportMessage}
                        onSendReply={handleSendReply}
                        showAvatar={!isConsecutive}
                        isConsecutive={isConsecutive}
                        isConnected={isConnected}
                      />
                    );
                  })}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          )}

          {/* Scroll to Bottom Button */}
          {showScrollToBottom && (
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={() => scrollToBottom()}
                className="h-10 w-10 p-0 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-accent dark:hover:bg-accent/90"
              >
                <ArrowUp className="h-4 w-4 text-white" />
              </Button>
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Input */}
        <ModernMessageInput
          onSendMessage={sendMessage}
          onStartTyping={startTyping}
          isConnected={isConnected && isReady}
          isLoading={isLoading}
          channelName={channelName}
        />
      </Card>

      {/* User List Sidebar */}
      {showUserList && (
        <div className="w-64 ml-4">
          <UserListSidebar users={users} />
        </div>
      )}

      {/* Toggle User List Button */}
      <div className="absolute top-4 right-4 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setUseVirtualization(!useVirtualization)}
          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Toggle Virtualization"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUserList(!showUserList)}
          className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Sidebar className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
