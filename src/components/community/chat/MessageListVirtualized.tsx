import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List, areEqual } from 'react-window';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { Message } from '@/types/chat';

interface VirtualizedMessageListProps {
  messages: Message[];
  height: number;
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<boolean>;
  onReplyMessage?: (messageId: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
}

interface MessageItemData {
  messages: Message[];
  currentUserId?: string;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onEditMessage?: (messageId: string, content: string) => Promise<boolean>;
  onReplyMessage?: (messageId: string) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
}

interface MessageItemProps {
  index: number;
  style: React.CSSProperties;
  data: MessageItemData;
}

const MessageItem: React.FC<MessageItemProps> = React.memo(({ 
  index, 
  style, 
  data 
}) => {
  const {
    messages,
    currentUserId,
    onDeleteMessage,
    onEditMessage,
    onReplyMessage,
    onReactMessage,
    onOpenThread
  } = data;

  const message = messages[index];
  const prevMessage = messages[index - 1];
  
  if (!message) {
    return <div style={style} />;
  }

  const isOwn = message.sender_id === currentUserId;
  const isConsecutive = prevMessage && 
    prevMessage.sender_id === message.sender_id &&
    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000; // 1 minute

  return (
    <div style={style} id={`message-${message.id}`}>
      <EnhancedMessageBubble
        message={message}
        isOwn={isOwn}
        onDelete={onDeleteMessage}
        onEdit={onEditMessage}
        onReply={onReplyMessage}
        onReact={onReactMessage}
        onOpenThread={onOpenThread}
        showAvatar={!isConsecutive}
        isConsecutive={isConsecutive}
      />
    </div>
  );
}, areEqual);

MessageItem.displayName = 'MessageItem';

export const MessageListVirtualized: React.FC<VirtualizedMessageListProps> = ({
  messages,
  height,
  currentUserId,
  onDeleteMessage,
  onEditMessage,
  onReplyMessage,
  onReactMessage,
  onOpenThread
}) => {
  // Memoize item data to prevent unnecessary re-renders
  const itemData = useMemo((): MessageItemData => ({
    messages,
    currentUserId,
    onDeleteMessage,
    onEditMessage,
    onReplyMessage,
    onReactMessage,
    onOpenThread
  }), [
    messages, 
    currentUserId, 
    onDeleteMessage, 
    onEditMessage, 
    onReplyMessage, 
    onReactMessage,
    onOpenThread
  ]);

  // Calculate dynamic item size based on message content
  const getItemSize = useCallback((index: number) => {
    const message = messages[index];
    if (!message) return 80;
    
    // Base size
    let size = 60;
    
    // Add height for content (rough estimate)
    const contentLines = Math.ceil(message.content.length / 50);
    size += contentLines * 20;
    
    // Add height for reactions
    if (message.reactions && message.reactions.length > 0) {
      size += 40;
    }
    
    // Add height for thread indicator
    if (message.thread_count && message.thread_count > 0) {
      size += 30;
    }
    
    // Max and min sizes
    return Math.min(Math.max(size, 60), 200);
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">No messages yet</p>
          <p className="text-xs">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={getItemSize}
      itemData={itemData}
      overscanCount={5} // Render 5 extra items for smooth scrolling
      className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
    >
      {MessageItem}
    </List>
  );
};