
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { ModernCollapsibleSidebar } from './enhanced/ModernCollapsibleSidebar';
import { ModernMessageBubble } from './enhanced/ModernMessageBubble';
import { EnhancedMessageInput } from './EnhancedMessageInput';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowDown } from 'lucide-react';

interface OptimizedCommunityPanelProps {
  defaultChannel?: string;
}

const OptimizedCommunityPanel: React.FC<OptimizedCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Use the simplified chat hook
  const { 
    messages, 
    isLoading, 
    error, 
    isConnected,
    sendMessage,
    deleteMessage
  } = useSimpleChat(activeChannel);

  // Enhanced default channels with better descriptions and icons
  const enhancedDefaultChannels = [
    { 
      id: 'general', 
      name: 'general', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'General discussion and community chat',
      unreadCount: 0,
      isPinned: false
    },
    { 
      id: 'announcement', 
      name: 'announcement', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'Important announcements and updates',
      unreadCount: 0,
      isPinned: false
    },
    { 
      id: 'morning-journey', 
      name: 'morning journey', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'Start your day with motivation and morning routines',
      unreadCount: 0,
      isPinned: false
    }
  ];

  const handleChannelSelect = useCallback((channelName: string) => {
    console.log('🔄 Switching to channel:', channelName);
    setActiveChannel(channelName);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  }, [isMobile]);

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) {
      console.log('⚠️ Empty message, not sending');
      return false;
    }

    if (!user?.id) {
      console.log('⚠️ User not authenticated, cannot send message');
      toast.error("You must be logged in to send messages");
      return false;
    }

    if (!isConnected) {
      console.log('⚠️ Not connected to chat, cannot send message');
      toast.error("Unable to send message - connection lost");
      return false;
    }

    try {
      console.log('📤 Handling message send:', content.substring(0, 50) + '...');
      await sendMessage(content);
      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error("💥 Error in handleSendMessage:", error);
      return false;
    }
  }, [user?.id, isConnected, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  }, [user?.id, deleteMessage]);

  const handleReply = useCallback((messageId: string) => {
    toast.info('Reply feature coming soon!');
  }, []);

  const handleReact = useCallback((messageId: string, emoji: string) => {
    toast.info('Reactions feature coming soon!');
  }, []);

  const scrollToBottom = useCallback(() => {
    const scrollContainer = document.getElementById('messages-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    setShowScrollToBottom(!isNearBottom && messages.length > 0);
  }, [messages.length]);

  // Show error state if there's a critical error
  if (error && user?.id) {
    return (
      <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Chat Temporarily Unavailable
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Join the Community
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            Sign in to participate in community discussions and connect with other members.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-4">
      <div className="h-full flex rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
        
        {/* Modern Collapsible Sidebar */}
        <ModernCollapsibleSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          channels={enhancedDefaultChannels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
          isConnected={isConnected}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">#</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {activeChannel}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {enhancedDefaultChannels.find(ch => ch.name === activeChannel)?.description || 'Channel discussion'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{messages.length} messages</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 relative bg-gradient-to-b from-slate-50/30 to-white dark:from-slate-900/30 dark:to-slate-800">
            <ScrollArea 
              className="h-full"
              id="messages-container"
              onScrollCapture={handleScroll}
            >
              <div className="py-4">
                {isLoading && messages.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
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
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center mb-4">
                      <span className="text-2xl">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      Welcome to #{activeChannel}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      Be the first to start the conversation!
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isOwn = message.sender_id === user?.id;
                    const isConsecutive = prevMessage &&
                      prevMessage.sender_id === message.sender_id &&
                      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;
                    
                    return (
                      <ModernMessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={!isConsecutive}
                        isConsecutive={isConsecutive}
                        isConnected={isConnected}
                        onReply={handleReply}
                        onReact={handleReact}
                        onDelete={isOwn ? handleDeleteMessage : undefined}
                      />
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Scroll to Bottom Button */}
            {showScrollToBottom && (
              <div className="absolute bottom-4 right-4">
                <Button
                  onClick={scrollToBottom}
                  className="h-12 w-12 p-0 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowDown className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          {/* Enhanced Message Input */}
          <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <EnhancedMessageInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected || isLoading}
              placeholder={
                !isConnected 
                  ? "Disconnected - messages will be sent when connection is restored"
                  : `Message #${activeChannel}...`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedCommunityPanel;
