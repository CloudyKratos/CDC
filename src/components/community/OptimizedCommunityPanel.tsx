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
import { EnhancedChatArea } from './EnhancedChatArea';

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
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      <div className="h-full rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
        <EnhancedChatArea
          activeChannel={activeChannel}
          messages={messages}
          isLoading={isLoading}
          isConnected={isConnected}
          error={error}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          channelsLoading={false}
        />
      </div>
    </div>
  );
};

export default OptimizedCommunityPanel;
