
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, MessageCircle, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import ChatWindow from './ChatWindow';
import ChannelSidebar from './ChannelSidebar';
import { ChannelType } from '@/types/chat';

interface CommunityPanelProps {
  defaultChannel?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const { user } = useAuth();
  const chatState = useCommunityChat(defaultChannel);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);

  // Mock channels data for the sidebar
  const mockChannels = [
    {
      id: 'general',
      name: 'general',
      type: ChannelType.PUBLIC,
      members: [],
      description: 'General discussion'
    },
    {
      id: 'announcements',
      name: 'announcements',
      type: ChannelType.PUBLIC,
      members: [],
      description: 'Important updates'
    }
  ];

  // Show auth required state
  if (!user) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
            <p className="text-gray-600 mb-4">
              Sign in to participate in community discussions and connect with other members.
            </p>
            <Button onClick={() => window.location.reload()}>
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (chatState.isLoading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Connecting to Chat</h3>
            <p className="text-gray-600">Setting up real-time messaging...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (chatState.error && !chatState.isConnected) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Connection Error</h3>
            <p className="text-gray-600 mb-4">{chatState.error}</p>
            <Button onClick={chatState.reconnect} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      <div className="h-full max-w-7xl mx-auto flex">
        {/* Channel Sidebar */}
        {sidebarOpen && (
          <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
            <ChannelSidebar
              channels={mockChannels}
              activeChannel={chatState.activeChannel}
              onChannelSelect={chatState.switchChannel}
              showChannelList={sidebarOpen}
              setShowChannelList={setSidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarOpen(true)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                )}
                <div>
                  <h1 className="text-xl font-semibold">
                    #{chatState.activeChannel}
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Community discussion
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge 
                  variant={chatState.isConnected ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {chatState.isConnected ? (
                    <>
                      <Wifi className="h-3 w-3" />
                      Live
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" />
                      Offline
                    </>
                  )}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={chatState.reconnect}
                  disabled={chatState.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${chatState.isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1">
            <ChatWindow
              messages={chatState.messages}
              onSendMessage={chatState.sendMessage}
              onDeleteMessage={chatState.deleteMessage}
              isConnected={chatState.isConnected}
              activeChannel={chatState.activeChannel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPanel;
