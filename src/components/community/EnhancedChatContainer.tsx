
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { ChannelNavigator } from './ChannelNavigator';
import { EnhancedChatArea } from './EnhancedChatArea';
import { MessageSearch } from './enhanced/MessageSearch';
import { Menu, X, Hash, Search, Bookmark, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  // Enhanced default channels with proper ordering and descriptions
  const enhancedDefaultChannels = [
    { 
      id: 'general', 
      name: 'general', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'General discussion and community chat' 
    },
    { 
      id: 'morning-journey', 
      name: 'morning journey', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'Start your day with motivation and morning routines' 
    },
    { 
      id: 'announcement', 
      name: 'announcement', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: 'Important announcements and updates' 
    }
  ];

  const displayChannels = channels.length > 0 ? 
    channels.map(channel => ({
      ...channel,
      description: channel.description || getChannelDescription(channel.name)
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

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  }, [isMobile, sidebarOpen, sidebarCollapsed]);

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
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="absolute top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Desktop Sidebar Toggle */}
        {!isMobile && (
          <div className="absolute top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Enhanced Sidebar with Tabs */}
        {(!isMobile || sidebarOpen) && (
          <div className={`${isMobile ? 'absolute inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 shadow-2xl' : ''} ${sidebarCollapsed ? 'w-16' : 'w-80'} border-r border-gray-200 dark:border-gray-800`}>
            <Card className="h-full border-0 rounded-none">
              <Tabs defaultValue="channels" className="h-full flex flex-col">
                {!sidebarCollapsed && (
                  <TabsList className="grid grid-cols-4 m-4">
                    <TabsTrigger value="channels" className="text-xs">
                      <Hash className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="search" className="text-xs">
                      <Search className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="bookmarks" className="text-xs">
                      <Bookmark className="h-4 w-4" />
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="text-xs">
                      <BarChart3 className="h-4 w-4" />
                    </TabsTrigger>
                  </TabsList>
                )}
                
                <div className="flex-1 overflow-hidden">
                  <TabsContent value="channels" className="h-full m-0">
                    <ChannelNavigator
                      channels={displayChannels}
                      activeChannel={activeChannel}
                      onChannelSelect={handleChannelSelect}
                      isCollapsed={sidebarCollapsed}
                    />
                  </TabsContent>
                  
                  <TabsContent value="search" className="h-full m-0 p-4">
                    <MessageSearch
                      messages={messages}
                      onSearch={handleSearch}
                      searchResults={searchResults}
                      currentQuery={searchQuery}
                    />
                  </TabsContent>
                  
                  <TabsContent value="bookmarks" className="h-full m-0 p-4">
                    <div className="text-center text-gray-500 mt-8">
                      <Bookmark className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Bookmarked messages will appear here</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analytics" className="h-full m-0 p-4">
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Channel Activity</h3>
                        <p className="text-2xl font-bold text-blue-600">{messages.length}</p>
                        <p className="text-xs text-gray-600">Total Messages</p>
                      </div>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-lg">
                        <h3 className="font-semibold text-sm mb-2">Online Status</h3>
                        <p className="text-2xl font-bold text-green-600">{isConnected ? 'Connected' : 'Offline'}</p>
                        <p className="text-xs text-gray-600">Connection Status</p>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </Card>
          </div>
        )}

        {/* Enhanced Chat Area */}
        <div className={`flex-1 ${isMobile && sidebarOpen ? 'hidden' : 'flex'} flex-col min-w-0`}>
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
