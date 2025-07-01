
import React from 'react';
import { useCommunityChat } from '@/hooks/useCommunityChat';
import SeamlessChatWindow from './community/SeamlessChatWindow';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  channelName = 'general' 
}) => {
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    deleteMessage,
    error,
    reconnect,
    onlineUsers
  } = useCommunityChat(channelName);

  // Mock functions for features not yet implemented
  const handleReplyToMessage = (messageId: string) => {
    console.log('Reply to message:', messageId);
    // TODO: Implement reply functionality
  };

  const handleAddReaction = async (messageId: string, reaction: string) => {
    console.log('Add reaction:', messageId, reaction);
    // TODO: Implement reaction functionality
  };

  if (error && !isConnected) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Connection Error
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={reconnect} className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Connecting to #{channelName}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SeamlessChatWindow
      messages={messages}
      onSendMessage={sendMessage}
      onDeleteMessage={deleteMessage}
      onReplyToMessage={handleReplyToMessage}
      onAddReaction={handleAddReaction}
      isConnected={isConnected}
      isSending={isLoading}
      activeChannel={channelName}
      onlineUsers={onlineUsers}
    />
  );
};

export default CommunityPanel;
