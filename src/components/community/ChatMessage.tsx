
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import type { Message } from "@/types/chat";
import MessageHeader from './message/MessageHeader';
import MessageContent from './message/MessageContent';
import MessageActions from './message/MessageActions';
import MessageReactionDisplay from './message/MessageReactionDisplay';

interface ChatMessageProps {
  message: Message;
  onReply?: (messageId: string) => void;
  onReaction?: (messageId: string, reaction: string) => void;
  onDelete?: (messageId: string) => void;
  isLast?: boolean;
  previousMessage?: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReply,
  onReaction,
  onDelete,
  isLast = false,
  previousMessage
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const { user } = useAuth();
  
  // Check if this message should be grouped with the previous one
  const shouldGroup = previousMessage && 
    previousMessage.sender_id === message.sender_id &&
    previousMessage.sender?.id === message.sender?.id &&
    new Date(message.created_at).getTime() - new Date(previousMessage.created_at).getTime() < 5 * 60 * 1000; // 5 minutes

  // Check if this is the current user's message
  const isOwnMessage = user?.id === message.sender_id;
  
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(message.id, reaction);
      toast.success(`Reacted with ${reaction}`);
    }
  };

  const handleAddReaction = () => {
    setShowReactions(!showReactions);
  };

  const handleDelete = () => {
    if (onDelete && isOwnMessage) {
      onDelete(message.id);
    }
  };

  // Ensure we have valid sender data
  const sender = message.sender || {
    id: message.sender_id,
    username: 'Unknown User',
    full_name: 'Unknown User',
    avatar_url: null
  };

  // Ensure we have valid content
  const content = message.content || '';
  
  return (
    <div 
      className={`group px-4 py-1 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 relative ${
        isLast ? 'mb-4' : ''
      } ${shouldGroup ? 'mt-0.5' : 'mt-4'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
          {!shouldGroup && (
            <MessageHeader 
              message={{ ...message, sender }}
              isOwnMessage={isOwnMessage}
              showAvatar={!isOwnMessage}
            />
          )}
          
          <div className={`${shouldGroup ? (isOwnMessage ? 'ml-0' : 'ml-16') : (isOwnMessage ? 'ml-0' : 'ml-16')}`}>
            <MessageContent 
              content={content}
              isOwnMessage={isOwnMessage}
              showTimestamp={shouldGroup}
              timestamp={message.created_at}
            />
            
            <MessageReactionDisplay 
              reactions={reactions}
              onReactionClick={handleReaction}
              onAddReaction={handleAddReaction}
              isOwnMessage={isOwnMessage}
            />
          </div>
        </div>
      </div>
      
      <MessageActions
        messageId={message.id}
        messageContent={content}
        showActions={showActions}
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        onReply={onReply}
        onDelete={isOwnMessage ? handleDelete : undefined}
        onReaction={onReaction}
        isOwnMessage={isOwnMessage}
      />
    </div>
  );
};

export default ChatMessage;
