
import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useChatManager } from '@/hooks/useChatManager';
import CommunityChannelSelector from './CommunityChannelSelector';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UnauthenticatedView from './UnauthenticatedView';
import { Button } from '@/components/ui/button';
import { Hash, Users, Settings, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LaunchReadyCommunityPanelProps {
  defaultChannel?: string;
}

const LaunchReadyCommunityPanel: React.FC<LaunchReadyCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const { user } = useAuth();

  // Use the new unified chat manager
  const {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage,
    addReaction,
    replyToMessage
  } = useChatManager({ channelName: activeChannel });

  if (!user) {
    return <UnauthenticatedView />;
  }

  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Sidebar */}
      <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community
            </h2>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Channel List */}
        <div className="flex-1 overflow-y-auto p-4">
          <CommunityChannelSelector
            activeChannel={activeChannel}
            onChannelSelect={setActiveChannel}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {activeChannel}
              </h3>
              {isConnected && (
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            onDeleteMessage={deleteMessage}
            onReplyMessage={replyToMessage}
            onReactionAdd={addReaction}
          />
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <MessageInput
            onSendMessage={sendMessage}
            isLoading={isLoading}
            channelName={activeChannel}
          />
        </div>
      </div>
    </div>
  );
};

export default LaunchReadyCommunityPanel;
