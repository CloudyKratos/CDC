
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useUnifiedCommunityChat } from '@/hooks/useUnifiedCommunityChat';
import EnhancedMessageList from './EnhancedMessageList';
import { MentionInput } from './MentionInput';

interface EnhancedChatContainerProps {
  channelName?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  channelName = 'general'
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  const {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    isConnected,
    unreadCount,
    users
  } = useUnifiedCommunityChat(channelName);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    const success = await sendMessage(content);
    if (success && replyingTo) {
      setReplyingTo(null);
    }
    return success;
  };

  const handleReplyToMessage = (messageId: string) => {
    setReplyingTo(messageId);
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    console.log('React to message:', messageId, 'with:', emoji);
    // TODO: Implement reaction functionality
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              # {channelName}
            </span>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <span className="flex items-center gap-1">
            📝 {messages.length} messages
          </span>
          <span className="flex items-center gap-1">
            👥 {users.length} online
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <EnhancedMessageList
          messages={messages}
          isLoading={isLoading}
          onDeleteMessage={deleteMessage}
          onReplyToMessage={handleReplyToMessage}
          onReactToMessage={handleReactToMessage}
        />
      </div>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
          <span>Replying to message</span>
          <button 
            onClick={() => setReplyingTo(null)}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Message Input */}
      <MentionInput
        onSendMessage={handleSendMessage}
        onTyping={() => {}}
        disabled={!isConnected}
        placeholder={replyingTo ? "Reply to message..." : "Type a message..."}
      />
    </div>
  );
};
