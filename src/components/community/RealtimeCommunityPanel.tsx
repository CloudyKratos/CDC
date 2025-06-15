
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { ChannelType } from '@/types/chat';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

interface RealtimeCommunityPanelProps {
  defaultChannel?: string;
}

const RealtimeCommunityPanel: React.FC<RealtimeCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isOnline, reconnecting, connectionAttempts } = useNetworkStatus();

  // Use the simplified chat hook
  const { 
    messages, 
    isLoading, 
    error, 
    isConnected,
    sendMessage,
    deleteMessage
  } = useSimpleChat(activeChannel);

  // Mock channels data for the sidebar
  const mockChannels = [
    { id: 'general', name: 'general', type: ChannelType.PUBLIC, members: [], description: 'General discussion' },
    { id: 'announcements', name: 'announcements', type: ChannelType.PUBLIC, members: [], description: 'Important announcements' },
    { id: 'entrepreneurs', name: 'entrepreneurs', type: ChannelType.PUBLIC, members: [], description: 'Entrepreneurial discussions' },
    { id: 'tech-talk', name: 'tech-talk', type: ChannelType.PUBLIC, members: [], description: 'Technology discussions' },
    { id: 'motivation', name: 'motivation', type: ChannelType.PUBLIC, members: [], description: 'Daily motivation' },
    { id: 'resources', name: 'resources', type: ChannelType.PUBLIC, members: [], description: 'Useful resources' }
  ];

  const handleChannelSelect = useCallback((channelId: string) => {
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
  }, [isMobile]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot send message while offline");
      return;
    }

    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
      // Error handling is done in the hook
    }
  }, [user?.id, isOnline, sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
      // Error handling is done in the hook
    }
  }, [user?.id, deleteMessage]);

  const handleRetry = () => {
    window.location.reload();
  };

  // Show error state only for severe errors, not for authentication issues
  if (error && error !== 'Please log in to access chat' && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 space-y-3">
            <div>Failed to load community chat: {error}</div>
            <Button onClick={handleRetry} variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate if we should show reconnecting state
  const isReconnecting = reconnecting || (!isConnected && !!user?.id);

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 relative">
      <ConnectionStatusIndicator 
        isOnline={isOnline && isConnected}
        reconnecting={isReconnecting}
        connectionAttempts={connectionAttempts}
      />

      <ChannelSidebar
        channels={mockChannels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isLoading={false}
        isMobile={isMobile}
        showChannelList={showChannelList}
        setShowChannelList={setShowChannelList}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <ChatHeader
          activeChannel={activeChannel}
          isOnline={isOnline && (isConnected || !user?.id)}
          reconnecting={isReconnecting}
          isMobile={isMobile}
          showChannelList={showChannelList}
          setShowChannelList={setShowChannelList}
          showMembersList={showMembersList}
          setShowMembersList={setShowMembersList}
        />
        
        {/* Messages and Input Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {!user ? (
              <UnauthenticatedView />
            ) : (
              <>
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading}
                  onDeleteMessage={handleDeleteMessage}
                />
                
                <MessageInput 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading || (!isConnected && !!user?.id)} 
                  channelName={activeChannel}
                  placeholder={
                    !isOnline ? "You're offline - message will be sent when connection is restored" :
                    (!isConnected && !!user?.id) ? "Connecting to real-time chat..." :
                    undefined
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCommunityPanel;
