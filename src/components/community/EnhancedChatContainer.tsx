
import React, { useState } from 'react';
import { useChatManager } from '@/hooks/useChatManager';
import { EnhancedChatHeader } from './modern/EnhancedChatHeader';
import EnhancedMessageList from './EnhancedMessageList';
import { MentionInput } from './enhanced/MentionInput';
import { MessageReplyThread } from './enhanced/MessageReplyThread';
import { EnhancedSidebar } from './enhanced/EnhancedSidebar';
import { QuickChannelSwitcher } from './enhanced/QuickChannelSwitcher';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface EnhancedChatContainerProps {
  channelName: string;
  onChannelChange?: (channel: string) => void;
}

// Mock users data - in real app this would come from API
const mockUsers = [
  { id: '1', username: 'alice', full_name: 'Alice Johnson', avatar_url: null },
  { id: '2', username: 'bob', full_name: 'Bob Smith', avatar_url: null },
  { id: '3', username: 'charlie', full_name: 'Charlie Brown', avatar_url: null },
];

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  channelName,
  onChannelChange
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    deleteMessage,
    error
  } = useChatManager(channelName);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    try {
      const success = await sendMessage(content);
      if (success && replyingTo) {
        setReplyingTo(null); // Clear reply after sending
      }
      return success;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyingTo(message);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    // TODO: Implement reaction system
    toast.success(`Reacted with ${emoji}`);
  };

  const handlePin = async (messageId: string) => {
    // TODO: Implement pin system
    toast.success('Message pinned');
  };

  const handleReport = async (messageId: string) => {
    // TODO: Implement report system
    toast.success('Message reported');
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      toast.error('Failed to delete message');
    }
  };

  return (
    <div className="flex h-full bg-background">
      {/* Sidebar */}
      <EnhancedSidebar
        activeChannel={channelName}
        onChannelSelect={onChannelChange}
        isConnected={isConnected}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <EnhancedChatHeader
          channelName={channelName}
          messageCount={messages.length}
          onlineUsers={1}
          isConnected={isConnected}
          isLoading={isLoading}
        />

        {/* Quick Channel Switcher */}
        <div className="p-2 border-b border-border">
          <QuickChannelSwitcher
            activeChannel={channelName}
            onChannelSelect={onChannelChange}
          />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <EnhancedMessageList
            messages={messages}
            isLoading={isLoading}
            onDeleteMessage={handleDeleteMessage}
            onReply={handleReply}
            onReact={handleReact}
            onPin={handlePin}
            onReport={handleReport}
          />
        </div>

        {/* Reply Thread */}
        <MessageReplyThread
          replyingTo={replyingTo}
          onCancel={() => setReplyingTo(null)}
        />

        {/* Message Input */}
        <MentionInput
          onSendMessage={handleSendMessage}
          isConnected={isConnected}
          isLoading={isLoading}
          placeholder={`Message #${channelName}...`}
          users={mockUsers}
        />
      </div>
    </div>
  );
};
