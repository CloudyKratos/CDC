
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ModernMessageBubble } from './ModernMessageBubble';
import type { Message } from '@/types/chat';

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, reaction: string) => void;
  currentUserId?: string;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: Message[];
    onDeleteMessage?: (messageId: string) => void;
    onReplyMessage?: (messageId: string) => void;
    onReactionAdd?: (messageId: string, reaction: string) => void;
    currentUserId?: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ index, style, data }) => {
  const { messages, onDeleteMessage, onReplyMessage, onReactionAdd, currentUserId } = data;
  const message = messages[index];
  const previousMessage = index > 0 ? messages[index - 1] : undefined;
  
  const isConsecutive = previousMessage && 
    previousMessage.sender_id === message.sender_id &&
    new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 60000;

  return (
    <div style={style}>
      <ModernMessageBubble
        message={message}
        isOwn={message.sender_id === currentUserId}
        onDelete={onDeleteMessage}
        onReply={onReplyMessage}
        onReact={onReactionAdd}
        showAvatar={!isConsecutive}
        isConsecutive={isConsecutive}
      />
    </div>
  );
};

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({
  messages,
  height,
  onDeleteMessage,
  onReplyMessage,
  onReactionAdd,
  currentUserId
}) => {
  const itemData = useMemo(() => ({
    messages,
    onDeleteMessage,
    onReplyMessage,
    onReactionAdd,
    currentUserId
  }), [messages, onDeleteMessage, onReplyMessage, onReactionAdd, currentUserId]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={80} // Average message height
      itemData={itemData}
      className="scrollbar-thin"
    >
      {MessageItem}
    </List>
  );
};
