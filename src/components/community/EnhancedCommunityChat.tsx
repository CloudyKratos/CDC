
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChatManager } from '@/hooks/useChatManager';
import ChatHeader from './chat/ChatHeader';
import MessagesList from './chat/MessagesList';
import MessageInput from './chat/MessageInput';

interface EnhancedCommunityChatProps {
  defaultChannel?: string;
}

const EnhancedCommunityChat: React.FC<EnhancedCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    isSending,
    error,
    reconnect
  } = useChatManager(activeChannel);

  // Channel switching
  const channels = [
    { id: 'general', name: 'general', emoji: '💬' },
    { id: 'announcements', name: 'announcements', emoji: '📢' },
    { id: 'entrepreneurs', name: 'entrepreneurs', emoji: '🚀' },
    { id: 'tech-talk', name: 'tech-talk', emoji: '💻' },
    { id: 'motivation', name: 'motivation', emoji: '💪' }
  ];

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      <ChatHeader
        activeChannel={activeChannel}
        channels={channels}
        onChannelChange={setActiveChannel}
        isConnected={isConnected}
        messageCount={messages.length}
        error={error}
        onReconnect={reconnect}
      />

      <CardContent className="flex-1 overflow-y-auto p-4">
        <MessagesList
          messages={messages}
          isLoading={isLoading}
          error={error}
          onReconnect={reconnect}
        />
      </CardContent>

      <MessageInput
        onSendMessage={sendMessage}
        isConnected={isConnected}
        isSending={isSending}
        activeChannel={activeChannel}
      />
    </div>
  );
};

export default EnhancedCommunityChat;
