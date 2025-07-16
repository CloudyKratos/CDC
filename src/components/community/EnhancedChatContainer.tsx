
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { ChannelNavigator } from './ChannelNavigator';
import { EnhancedChatArea } from './EnhancedChatArea';
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

  // Enhanced default channels with the three requested channels
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

  if (!user) {
    return (
      <div className={`h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 flex items-center justify-center p-4 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Join the Community
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Sign in to participate in community discussions and connect with other members.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 ${className}`}>
      <div className="h-full flex rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50">
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="absolute top-4 left-4 z-50">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        )}

        {/* Channel Navigator */}
        {(!isMobile || sidebarOpen) && (
          <ChannelNavigator
            channels={displayChannels}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            isCollapsed={isMobile ? false : !sidebarOpen}
          />
        )}

        {/* Enhanced Chat Area */}
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
  );
};
