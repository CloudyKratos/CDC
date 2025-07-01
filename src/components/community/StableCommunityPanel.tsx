
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useStableCommunityChat } from './hooks/useStableCommunityChat';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Users, Wifi, WifiOff, Hash } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChannelSidebar from './ChannelSidebar';
import UnauthenticatedView from './UnauthenticatedView';

interface StableCommunityPanelProps {
  defaultChannel?: string;
}

const StableCommunityPanel: React.FC<StableCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  const { 
    messages, 
    isLoading, 
    isConnected, 
    error, 
    sendMessage, 
    deleteMessage,
    onlineUsers,
    isTyping,
    startTyping,
    stopTyping,
    reconnect
  } = useStableCommunityChat(activeChannel);

  // Enhanced channels with better descriptions
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
    }
  ];

  const handleChannelSelect = useCallback((channelId: string) => {
    console.log('🔄 Switching to channel:', channelId);
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
    toast.success(`Switched to #${channelId}`, { duration: 1000 });
  }, [isMobile]);

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    startTyping();
    const success = await sendMessage(content);
    stopTyping();
    return success;
  }, [sendMessage, startTyping, stopTyping]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    await deleteMessage(messageId);
  }, [deleteMessage]);

  // Connection status component
  const ConnectionStatus = () => {
    if (!user) return null;
    
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-xs">
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3 text-green-500" />
            <span className="text-green-700 dark:text-green-400 font-medium">Connected</span>
            {onlineUsers.length > 0 && (
              <span className="text-slate-500">• {onlineUsers.length} online</span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 text-red-500" />
            <span className="text-red-700 dark:text-red-400 font-medium">Disconnected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={reconnect}
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
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
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
                  onClick={reconnect} 
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
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Channel Sidebar */}
      <ChannelSidebar
        channels={defaultChannels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isLoading={false}
        isMobile={isMobile}
        showChannelList={showChannelList}
        setShowChannelList={setShowChannelList}
      />

      {/* Main Chat Container */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-700">
        {/* Enhanced Chat Header */}
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
                <h2 className="font-bold text-slate-900 dark:text-slate-100 capitalize">
                  {activeChannel}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {defaultChannels.find(ch => ch.id === activeChannel)?.description || 'Community discussion'}
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
                        onClick={reconnect}
                        className="ml-3 h-6 px-2 text-xs"
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Messages Area */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
                  <MessageList 
                    messages={messages} 
                    isLoading={isLoading}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span>Someone is typing...</span>
                    </div>
                  </div>
                )}
                
                {/* Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading || !isConnected} 
                    activeChannel={activeChannel}
                    placeholder={
                      !isConnected ? "Offline - messages will queue and send when connection is restored" :
                      undefined
                    }
                  />
                </div>
              </>
            )}
          </div>

          {/* Online Members Sidebar */}
          {showMembersList && (
            <div className="w-64 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-l border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Online Members ({onlineUsers.length})
                </h3>
              </div>
              <div className="space-y-2">
                {onlineUsers.map(userId => (
                  <div key={userId} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      {userId}
                    </span>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <div className="text-sm text-slate-500 dark:text-slate-400 italic">
                    No users online
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StableCommunityPanel;
