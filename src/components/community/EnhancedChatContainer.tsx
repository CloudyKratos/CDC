
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { EnhancedChatArea } from './EnhancedChatArea';
import { EnhancedSidebar } from './enhanced/EnhancedSidebar';
import { ChatStatusBar } from './enhanced/ChatStatusBar';
import { QuickChannelSwitcher } from './enhanced/QuickChannelSwitcher';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
  className?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  defaultChannel = 'general',
  className = ''
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { channels, isLoading: channelsLoading } = useCommunityData();
  
  const { 
    messages, 
    isLoading: chatLoading, 
    error, 
    isConnected, 
    sendMessage, 
    deleteMessage 
  } = useSimpleChat(activeChannel);

  // Enhanced default channels
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
      id: 'morning-journey', 
      name: 'morning journey', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'Start your day with motivation and morning routines',
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
    }
  ];

  const displayChannels = channels.length > 0 ? 
    channels.map(channel => ({
      ...channel,
      description: channel.description || getChannelDescription(channel.name),
      unreadCount: 0,
      isPinned: false
    })) : 
    enhancedDefaultChannels;

  const getChannelDescription = (channelName: string) => {
    switch (channelName) {
      case 'morning journey':
        return 'Start your day with motivation and morning routines';
      case 'announcement':
        return 'Important announcements and updates';
      case 'general':
      default:
        return 'General discussion and community chat';
    }
  };

  const handleChannelSelect = useCallback((channelName: string) => {
    console.log('🔄 Switching to channel:', channelName);
    setActiveChannel(channelName);
    if (isMobile) {
      setSidebarOpen(false);
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
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [user?.id, deleteMessage]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = messages.filter(msg => 
        msg.content.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [messages]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen]);

  if (!user) {
    return (
      <div className={`h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-6 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <span className="text-3xl">💬</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Community
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
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
    <div className={`h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-4 ${className}`}>
      <div className="h-full flex rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 relative">
        
        {/* Mobile Header with Toggle */}
        {isMobile && (
          <div className="absolute top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            <QuickChannelSwitcher
              channels={displayChannels}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              className="flex-1 mx-4"
            />
            
            <div className="w-8" /> {/* Spacer */}
          </div>
        )}

        {/* Enhanced Sidebar */}
        {(!isMobile || sidebarOpen) && (
          <div className={`${isMobile ? 'absolute inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 shadow-2xl' : ''} flex-shrink-0`}>
            <EnhancedSidebar
              channels={displayChannels}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              messages={messages}
              onSearch={handleSearch}
              searchResults={searchResults}
              currentQuery={searchQuery}
              isConnected={isConnected}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className={`flex-1 ${isMobile && sidebarOpen ? 'hidden' : 'flex'} flex-col min-w-0 ${isMobile ? 'pt-16' : ''}`}>
          {/* Desktop Header with Status */}
          {!isMobile && (
            <div className="flex-shrink-0">
              <div className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900">
                <QuickChannelSwitcher
                  channels={displayChannels}
                  activeChannel={activeChannel}
                  onChannelSelect={handleChannelSelect}
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSidebar}
                  className="h-8 w-8 p-0"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </div>
              
              <ChatStatusBar
                isConnected={isConnected}
                isLoading={chatLoading || channelsLoading}
                messageCount={messages.length}
                activeUsers={1}
                onReconnect={() => window.location.reload()}
              />
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-1 min-h-0">
            <EnhancedChatArea
              activeChannel={activeChannel}
              messages={messages}
              isLoading={chatLoading}
              isConnected={isConnected}
              error={error}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              channelsLoading={channelsLoading}
            />
          </div>
        </div>

        {/* Mobile overlay when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
