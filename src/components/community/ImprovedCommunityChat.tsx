import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Hash, Users, MessageCircle, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ImprovedCommunityChatProps {
  defaultChannel?: string;
}

const ImprovedCommunityChat: React.FC<ImprovedCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
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

  // Enhanced default channels with better descriptions
  const defaultChannels = [
    { 
      id: 'general', 
      name: 'general', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '💬 General community discussions and introductions' 
    },
    { 
      id: 'announcements', 
      name: 'announcements', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '📢 Important community announcements and updates' 
    },
    { 
      id: 'entrepreneurs', 
      name: 'entrepreneurs', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '🚀 Entrepreneurial discussions and business ideas' 
    },
    { 
      id: 'tech-talk', 
      name: 'tech-talk', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '💻 Technology discussions and programming help' 
    },
    { 
      id: 'motivation', 
      name: 'motivation', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '💪 Daily motivation and success stories' 
    },
    { 
      id: 'resources', 
      name: 'resources', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '📚 Useful resources, tools, and learning materials' 
    },
    { 
      id: 'networking', 
      name: 'networking', 
      type: ChannelType.PUBLIC, 
      members: [], 
      description: '🤝 Professional networking and collaborations' 
    }
  ];

  // Use channels from API if available, otherwise use defaults
  const displayChannels = channels.length > 0 ? 
    channels.map(channel => ({
      ...channel,
      description: channel.description || `${channel.name} channel discussion`
    })) : 
    defaultChannels;

  const handleChannelSelect = useCallback((channelId: string) => {
    console.log('🔄 Switching to channel:', channelId);
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
    toast.success(`Switched to #${channelId}`, { duration: 1000 });
  }, [isMobile]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      console.log('⚠️ Empty message, not sending');
      return;
    }

    if (!user?.id) {
      console.log('⚠️ User not authenticated, cannot send message');
      toast.error("Please log in to send messages");
      return;
    }

    if (!isConnected) {
      console.log('⚠️ Not connected to chat, cannot send message');
      toast.error("Connection lost - please wait for reconnection");
      return;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50) + '...');
      await sendMessage(content);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error("💥 Error sending message:", error);
      toast.error("Failed to send message - please try again");
    }
  }, [user?.id, isConnected, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
      toast.success("Message deleted", { duration: 1000 });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id, deleteMessage]);

  const handleRetryConnection = useCallback(() => {
    setRetryCount(prev => prev + 1);
    toast.info("Attempting to reconnect...");
    // The useSimpleChat hook will handle reconnection automatically
  }, []);

  // Get current channel info
  const currentChannel = displayChannels.find(ch => ch.id === activeChannel);

  // Connection status indicator
  const ConnectionStatus = () => {
    if (!user) return null;
    
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-xs">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span className="text-red-700 dark:text-red-400 font-medium">Disconnected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetryConnection}
              className="h-5 w-5 p-0 ml-1"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </>
        )}
      </div>
    );
  };

  // Enhanced error state
  if (error && user?.id) {
    return (
      <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Chat Connection Issue
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={handleRetryConnection} 
                className="w-full flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Refresh Page
              </Button>
            </div>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-4">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Enhanced Channel Sidebar */}
      <ChannelSidebar
        channels={displayChannels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isLoading={channelsLoading}
        isMobile={isMobile}
        showChannelList={showChannelList}
        setShowChannelList={setShowChannelList}
      />

      {/* Main Chat Container */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-700">
        {/* Enhanced Chat Header with better channel info */}
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannelList(!showChannelList)}
                className="h-8 w-8 p-0"
              >
                <Hash size={18} />
              </Button>
            )}
            
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Hash size={18} className="text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
                  {activeChannel}
                  <MessageCircle size={16} className="text-slate-500" />
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {currentChannel?.description || 'Community discussion'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionStatus />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembersList(!showMembersList)}
              className="h-8 w-8 p-0 hidden md:flex"
            >
              <Users size={18} />
            </Button>
          </div>
        </div>
        
        {/* Messages and Input Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Chat Content */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-slate-900">
            {!user ? (
              <UnauthenticatedView />
            ) : (
              <>
                {/* Connection Status Banner */}
                {!isConnected && user && !error && (
                  <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
                    <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
                      <div className="animate-pulse mr-3">
                        <WifiOff className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Reconnecting to real-time chat...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRetryConnection}
                        className="ml-3 h-6 px-2 text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Messages Area with enhanced styling */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
                  <MessageList 
                    messages={messages} 
                    isLoading={chatLoading}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                
                {/* Enhanced Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={chatLoading || !isConnected} 
                    activeChannel={activeChannel}
                  />
                </div>
              </>
            )}
          </div>

          {/* Enhanced Members List Sidebar */}
          {showMembersList && (
            <div className="w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-l border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Community Members
                </h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    💡 Member list coming soon!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    We're working on showing online members and user presence.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImprovedCommunityChat;
