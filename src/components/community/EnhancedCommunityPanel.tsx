
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCommunityChat } from '@/hooks/use-community-chat';
import { useChannelData } from '@/hooks/use-channel-data';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useChatActions } from './hooks/useChatActions';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';
import UnauthenticatedView from './UnauthenticatedView';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedCommunityPanelProps {
  defaultChannel?: string;
}

const EnhancedCommunityPanel: React.FC<EnhancedCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { isOnline, reconnecting, connectionAttempts } = useNetworkStatus();

  // Use custom hooks for chat and channel data
  const {
    messages,
    isLoading: chatLoading,
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction
  } = useCommunityChat(activeChannel);

  const {
    channels,
    isLoading: channelsLoading,
    error: channelsError
  } = useChannelData('warrior-community', activeChannel);

  // Chat actions with enhanced error handling
  const {
    handleSendMessage,
    handleDeleteMessage,
    handleReactionAdd,
    handleReplyMessage
  } = useChatActions(sendMessage, deleteMessage, replyToMessage, addReaction, isOnline);

  const handleChannelSelect = useCallback((channelId: string) => {
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
  }, [isMobile]);

  const handleRetryConnection = () => {
    // Force a page refresh as last resort
    setTimeout(() => {
      if (!navigator.onLine) {
        window.location.reload();
      }
    }, 3000);
  };

  // Error state with retry option
  if (channelsError) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Alert className="max-w-md border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 space-y-3">
            <div>Failed to load community channels. This might be due to connection issues.</div>
            <Button onClick={handleRetryConnection} variant="outline" size="sm" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50 relative">
      <ConnectionStatusIndicator 
        isOnline={isOnline}
        reconnecting={reconnecting}
        connectionAttempts={connectionAttempts}
      />

      <ChannelSidebar
        channels={channels}
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        isLoading={channelsLoading}
        isMobile={isMobile}
        showChannelList={showChannelList}
        setShowChannelList={setShowChannelList}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <ChatHeader
          activeChannel={activeChannel}
          isOnline={isOnline}
          reconnecting={reconnecting}
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
                  isLoading={chatLoading}
                  onDeleteMessage={handleDeleteMessage}
                  onReplyMessage={handleReplyMessage}
                  onReactionAdd={handleReactionAdd}
                />
                
                <MessageInput 
                  onSendMessage={handleSendMessage} 
                  isLoading={chatLoading || (!isOnline && !reconnecting)} 
                  channelName={activeChannel}
                  placeholder={!isOnline ? "You're offline - message will be sent when connection is restored" : undefined}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommunityPanel;
