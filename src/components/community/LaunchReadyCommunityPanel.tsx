
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface LaunchReadyCommunityPanelProps {
  defaultChannel?: string;
}

const LaunchReadyCommunityPanel: React.FC<LaunchReadyCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Use the refactored simple chat hook
  const { 
    messages, 
    isLoading, 
    isConnected, 
    sendMessage, 
    deleteMessage 
  } = useSimpleChat(activeChannel);

  // Default channels for launch
  const channels = [
    { id: 'general', name: 'general', type: ChannelType.PUBLIC, members: [], description: 'General discussion' },
    { id: 'announcements', name: 'announcements', type: ChannelType.PUBLIC, members: [], description: 'Important announcements' },
    { id: 'entrepreneurs', name: 'entrepreneurs', type: ChannelType.PUBLIC, members: [], description: 'Entrepreneurial discussions' },
    { id: 'tech-talk', name: 'tech-talk', type: ChannelType.PUBLIC, members: [], description: 'Technology discussions' },
    { id: 'motivation', name: 'motivation', type: ChannelType.PUBLIC, members: [], description: 'Daily motivation' },
    { id: 'resources', name: 'resources', type: ChannelType.PUBLIC, members: [], description: 'Useful resources' }
  ];

  const handleChannelSelect = useCallback((channelId: string) => {
    console.log('🔄 Switching to channel:', channelId);
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
  }, [isMobile]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
      // Error handling is done in the hook
    }
  }, [user?.id, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      // Error handling is done in the hook
    }
  }, [user?.id, deleteMessage]);

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Channel Sidebar */}
      <ChannelSidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isLoading={false}
        isMobile={isMobile}
        showChannelList={showChannelList}
        setShowChannelList={setShowChannelList}
      />

      {/* Main Chat Container */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-white dark:bg-slate-900 shadow-xl border-l border-slate-200 dark:border-slate-700">
        {/* Chat Header */}
        <ChatHeader
          activeChannel={activeChannel}
          isOnline={isConnected}
          reconnecting={!isConnected && !!user?.id}
          isMobile={isMobile}
          showChannelList={showChannelList}
          setShowChannelList={setShowChannelList}
          showMembersList={showMembersList}
          setShowMembersList={setShowMembersList}
        />
        
        {/* Messages and Input Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Main Chat Content */}
          <div className="flex flex-col flex-1 overflow-hidden bg-white dark:bg-slate-900">
            {!user ? (
              <UnauthenticatedView />
            ) : (
              <>
                {/* Connection Status */}
                {!isConnected && user && (
                  <div className="bg-amber-100 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
                    <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
                      <div className="animate-pulse mr-2">🔄</div>
                      Connecting to real-time chat...
                    </div>
                  </div>
                )}
                
                {/* Success indicator when connected */}
                {isConnected && user && (
                  <div className="bg-green-100 dark:bg-green-900/20 border-b border-green-200 dark:border-green-800 px-4 py-1">
                    <div className="flex items-center justify-center text-xs text-green-800 dark:text-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Real-time chat active
                    </div>
                  </div>
                )}
                
                {/* Messages Area */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                  <MessageList 
                    messages={messages} 
                    isLoading={isLoading}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                
                {/* Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={isLoading || (!isConnected && !!user?.id)} 
                    channelName={activeChannel}
                    placeholder={
                      !isConnected && !!user?.id ? "Connecting..." : 
                      `Message #${activeChannel.replace(/-/g, ' ')}...`
                    }
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchReadyCommunityPanel;
