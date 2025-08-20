import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleChat } from '../community/hooks/useSimpleChat';
import { useCommunityData } from '../community/hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { EnhancedChatArea } from '../community/EnhancedChatArea';
import { EnhancedSidebar } from '../community/enhanced/EnhancedSidebar';
import { ChatStatusBar } from '../community/enhanced/ChatStatusBar';
import { QuickChannelSwitcher } from '../community/enhanced/QuickChannelSwitcher';
import { Menu, X, MessageCircle, Users, Hash, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MobileCommunityChatProps {
  defaultChannel?: string;
}

const MobileCommunityChat: React.FC<MobileCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const { user } = useAuth();
  const { channels, isLoading: channelsLoading } = useCommunityData();
  
  const chatState = useSimpleChat(activeChannel);
  const { 
    messages = [], 
    isLoading: chatLoading = false, 
    error = null, 
    isConnected = false, 
    sendMessage = async () => false, 
    deleteMessage = async () => {} 
  } = chatState || {};

  // Only 4 channels as requested
  const defaultChannels = [
    { 
      id: 'announcement', 
      name: 'announcement', 
      type: ChannelType.PUBLIC, 
      members: [], 
      unreadCount: 0,
      description: 'Important announcements and updates'
    },
    { 
      id: 'general', 
      name: 'general', 
      type: ChannelType.PUBLIC, 
      members: [], 
      unreadCount: 0,
      description: 'General discussion and community chat'
    },
    { 
      id: 'morning-journey', 
      name: 'morning journey', 
      type: ChannelType.PUBLIC, 
      members: [], 
      unreadCount: 0,
      description: 'Start your day with motivation and morning routines'
    },
    { 
      id: 'random', 
      name: 'random', 
      type: ChannelType.PUBLIC, 
      members: [], 
      unreadCount: 0,
      description: 'Random conversations and off-topic discussions'
    }
  ];

  // Use only the default 4 channels
  const allChannels = defaultChannels;
  const currentChannel = allChannels.find(c => c.id === activeChannel || c.name === activeChannel);
  
  // Get channel icon helper
  const getChannelIcon = (channelName: string) => {
    switch (channelName.toLowerCase()) {
      case 'announcement':
        return MessageCircle;
      case 'general':
        return Hash;
      case 'morning journey':
        return Clock;
      case 'random':
        return Users;
      default:
        return Hash;
    }
  };

  const handleChannelSelect = useCallback((channelName: string) => {
    console.log('Mobile chat: Switching to channel:', channelName);
    setActiveChannel(channelName);
    setSidebarOpen(false); // Auto-close sidebar on mobile after selection
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    try {
      console.log('Mobile chat: Sending message:', content);
      const success = await sendMessage(content);
      if (!success) {
        toast.error('Failed to send message. Please try again.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Mobile chat: Error sending message:', error);
      toast.error('Error sending message');
      return false;
    }
  }, [sendMessage]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      console.log('Mobile chat: Deleting message:', messageId);
      await deleteMessage(messageId);
      toast.success('Message deleted');
    } catch (error) {
      console.error('Mobile chat: Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  }, [deleteMessage]);

  const handleSearch = useCallback((query: string) => {
    console.log('Mobile chat: Searching:', query);
    setSearchQuery(query);
    // Implement search logic here
    setSearchResults([]);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Show sign-in prompt if not authenticated
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Join the Community
            </h3>
            <p className="text-muted-foreground mb-4">
              Sign in to participate in community discussions and connect with other members.
            </p>
            <Button className="w-full">
              Sign In to Chat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Mobile Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 touch-feedback"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex items-center space-x-2">
            {React.createElement(getChannelIcon(currentChannel?.name || activeChannel), {
              className: "h-5 w-5 text-primary"
            })}
            <h1 className="font-semibold text-lg">
              #{currentChannel?.name || activeChannel}
            </h1>
            {currentChannel?.unreadCount && currentChannel.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                {currentChannel.unreadCount}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ChatStatusBar 
            isConnected={isConnected} 
            isLoading={chatLoading || channelsLoading}
            messageCount={messages.length}
            activeUsers={1}
            className="text-sm"
          />
        </div>
      </div>

      {/* Mobile Channel Quick Switcher */}
      <div className="bg-muted/30 px-4 py-2 border-b border-border">
        <QuickChannelSwitcher
          channels={allChannels}
          activeChannel={activeChannel}
          onChannelSelect={handleChannelSelect}
          className="scrollbar-hide"
        />
      </div>

      {/* Main Chat Content */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Enhanced Sidebar - Mobile Overlay */}
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-80 z-50 lg:relative lg:z-auto">
              <EnhancedSidebar
                channels={allChannels}
                activeChannel={activeChannel}
                onChannelSelect={handleChannelSelect}
                messages={messages}
                onSearch={handleSearch}
                searchResults={searchResults}
                currentQuery={searchQuery}
                isConnected={isConnected}
                className="h-full border-r-0 lg:border-r shadow-xl lg:shadow-none"
              />
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <EnhancedChatArea
            activeChannel={activeChannel}
            messages={messages}
            isLoading={chatLoading}
            isConnected={isConnected}
            error={error}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            channelsLoading={channelsLoading}
            className="flex-1 mobile-chat-optimized"
          />
        </div>
      </div>

      {/* Connection Status Footer */}
      {(!isConnected || error) && (
        <div className="bg-destructive/10 border-t border-destructive/20 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-destructive">
            {!isConnected && <span>Reconnecting...</span>}
            {error && <span>Connection error</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileCommunityChat;