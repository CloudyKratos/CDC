
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface SimpleCommunityPanelProps {
  defaultChannel?: string;
}

const SimpleCommunityPanel: React.FC<SimpleCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
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

  // Use default channels if none loaded
  const displayChannels = channels.length > 0 ? channels : [
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
    if (!content.trim()) {
      console.log('⚠️ Empty message, not sending');
      return;
    }

    if (!user?.id) {
      console.log('⚠️ User not authenticated, cannot send message');
      toast.error("You must be logged in to send messages");
      return;
    }

    try {
      console.log('📤 Handling message send:', content);
      await sendMessage(content);
      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error("💥 Error in handleSendMessage:", error);
    }
  }, [user?.id, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }, [user?.id, deleteMessage]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 SimpleCommunityPanel Debug:', {
      activeChannel,
      user: user?.id,
      isConnected,
      messagesCount: messages.length,
      chatLoading,
      error
    });
  }, [activeChannel, user?.id, isConnected, messages.length, chatLoading, error]);

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
        {/* Enhanced Chat Header */}
        <ChatHeader
          activeChannel={activeChannel}
          isOnline={isConnected}
          reconnecting={false}
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
                {/* Connection Status Indicator */}
                {!isConnected && user && !error && (
                  <div className="bg-amber-100 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
                    <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
                      <div className="animate-pulse mr-2">🔄</div>
                      Connecting to real-time chat...
                    </div>
                  </div>
                )}
                
                {/* Messages Area */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                  <MessageList 
                    messages={messages} 
                    isLoading={chatLoading}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                
                {/* Enhanced Message Input */}
                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <MessageInput 
                    onSendMessage={handleSendMessage} 
                    isLoading={chatLoading} 
                    channelName={activeChannel}
                    placeholder={`Message #${activeChannel.replace(/-/g, ' ')}...`}
                  />
                </div>
              </>
            )}
          </div>

          {/* Members List Sidebar (if needed) */}
          {showMembersList && (
            <div className="w-64 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Online Members
              </h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Members list coming soon...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleCommunityPanel;
