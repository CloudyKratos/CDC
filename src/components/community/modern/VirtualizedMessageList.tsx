
import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { Message } from '@/types/chat';

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  onDeleteMessage?: (messageId: string) => void;
  onReplyMessage?: (messageId: string) => void;
  onReactionAdd?: (messageId: string, emoji: string) => void;
  currentUserId?: string;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: {
    messages: Message[];
    onDeleteMessage?: (messageId: string) => void;
    onReplyMessage?: (messageId: string) => void;
    onReactionAdd?: (messageId: string, emoji: string) => void;
    currentUserId?: string;
  };
}

const MessageItem: React.FC<MessageItemProps> = ({ index, style, data }) => {
  const { messages, onDeleteMessage, onReplyMessage, onReactionAdd, currentUserId } = data;
  const message = messages[index];
  const prevMessage = messages[index - 1];
  
  const isOwn = message.sender_id === currentUserId;
  const isConsecutive = prevMessage && 
    prevMessage.sender_id === message.sender_id &&
    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000; // 1 minute

  return (
    <div style={style}>
      <EnhancedModernMessageBubble
        message={message}
        isOwn={isOwn}
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
        <p className="text-gray-500 dark:text-gray-400">No messages yet</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={80} // Average message height
      itemData={itemData}
    >
      {MessageItem}
    </List>
  );
};
