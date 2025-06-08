
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message, ChatChannel } from '@/types/chat';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCommunityChat } from '@/hooks/use-community-chat';
import { useChannelData } from '@/hooks/use-channel-data';
import ServerSidebar from './ServerSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Button } from '@/components/ui/button';
import { Users, Hash, AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

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

  // Network status monitoring with retry logic
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnecting(false);
      setConnectionAttempts(0);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnecting(true);
      toast.error('Connection lost - attempting to reconnect...');
    };

    // Connection retry logic
    const retryConnection = () => {
      if (!navigator.onLine && connectionAttempts < 5) {
        setConnectionAttempts(prev => prev + 1);
        setTimeout(retryConnection, 5000); // Retry every 5 seconds
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start retry logic if offline
    if (!navigator.onLine) {
      retryConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionAttempts]);

  // Enhanced message sending with optimistic updates and retry logic
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot send message while offline. Message will be sent when connection is restored.");
      return;
    }

    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      throw error;
    }
  }, [user?.id, sendMessage, isOnline]);

  // Enhanced message deletion with confirmation
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id, deleteMessage]);

  // Enhanced reaction handling
  const handleReactionAdd = useCallback(async (messageId: string, reaction: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to react");
      return;
    }

    if (!isOnline) {
      toast.error("Cannot add reactions while offline");
      return;
    }

    try {
      await addReaction(messageId, reaction);
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast.error('Failed to add reaction');
    }
  }, [user?.id, addReaction, isOnline]);

  const handleChannelSelect = useCallback((channelId: string) => {
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
  }, [isMobile]);

  const getChannelDisplayName = (channelName: string) => {
    return channelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleRetryConnection = () => {
    setReconnecting(true);
    setConnectionAttempts(0);
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
      {/* Connection status indicator */}
      {(!isOnline || reconnecting) && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-medium z-50">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="inline w-4 h-4" />
            {reconnecting ? 
              `Reconnecting... (Attempt ${connectionAttempts}/5)` : 
              'You\'re offline. Messages will be sent when connection is restored.'
            }
          </div>
        </div>
      )}

      {/* Channel Sidebar */}
      <div className={`${isMobile && !showChannelList ? 'hidden' : ''} ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-80' : 'w-80'} bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg`}>
        <ServerSidebar
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
          isLoading={channelsLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Channel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannelList(!showChannelList)}
                className="md:hidden"
              >
                <Hash size={16} />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Hash size={20} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                {getChannelDisplayName(activeChannel)}
              </h2>
              {!isOnline && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
              {reconnecting && (
                <Badge variant="secondary" className="text-xs">
                  Reconnecting...
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {isOnline && !reconnecting ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembersList(!showMembersList)}
              className="hidden lg:flex"
            >
              <Users size={16} />
            </Button>
          </div>
        </div>
        
        {/* Messages and Input Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {!user ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Join the Conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please log in to participate in community discussions and connect with fellow warriors.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <MessageList 
                  messages={messages} 
                  isLoading={chatLoading}
                  onDeleteMessage={handleDeleteMessage}
                  onReplyMessage={replyToMessage}
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

      {/* Mobile overlay */}
      {isMobile && showChannelList && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setShowChannelList(false)}
        />
      )}
    </div>
  );
};

export default EnhancedCommunityPanel;
