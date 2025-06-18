
import React from 'react';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import MessageHeader from './MessageHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageAreaProps {
  recipientId: string;
  onClose: () => void;
}

const MessageArea: React.FC<MessageAreaProps> = ({ recipientId, onClose }) => {
  const {
    messages,
    conversations,
    isLoading,
    isConnected,
    sendMessage,
    deleteMessage
  } = useDirectMessages(recipientId);

  // Find the conversation to get recipient info
  const conversation = conversations.find(conv => 
    conv.other_participant?.id === recipientId
  );

  const recipient = conversation?.other_participant;

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <MessageHeader
        recipient={recipient}
        isConnected={isConnected}
        onClose={onClose}
      />
      
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          onDeleteMessage={deleteMessage}
        />
      </div>
      
      <MessageInput
        onSendMessage={(content) => sendMessage(content)}
        isLoading={isLoading}
        recipientName={recipient?.full_name || recipient?.username || 'User'}
      />
    </div>
  );
};

export default MessageArea;
