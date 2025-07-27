
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import { EnhancedMessageList } from './EnhancedMessageList';
import { EnhancedMessageInput } from './EnhancedMessageInput';

interface OptimizedCommunityPanelProps {
  defaultChannel?: string;
}

const OptimizedCommunityPanel: React.FC<OptimizedCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
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

  // Default channels for the app
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

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) return false;

    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return false;
    }

    if (!isConnected) {
      toast.error("Not connected to chat. Please wait...");
      return false;
    }

    try {
      console.log('📤 Attempting to send message to channel:', activeChannel);
      const success = await sendMessage(content);
      return success;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      return false;
    }
  }, [user?.id, isConnected, sendMessage, activeChannel]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error("Failed to delete message");
    }
  }, [user?.id, deleteMessage]);

  // Show error state if there's a critical error
  if (error && user?.id) {
    return (
      <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Chat Temporarily Unavailable
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
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

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Enhanced Channel Sidebar */}
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
        {/* Enhanced Chat Header */}
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
                {/* Enhanced Messages Area */}
                <div className="flex-1 overflow-hidden bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/50">
                  <EnhancedMessageList 
                    messages={messages} 
                    isLoading={isLoading}
                    onDeleteMessage={handleDeleteMessage}
                  />
                </div>
                
                {/* Enhanced Message Input */}
                <EnhancedMessageInput 
                  onSendMessage={handleSendMessage} 
                  disabled={!isConnected && !!user?.id}
                />
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

export default OptimizedCommunityPanel;
