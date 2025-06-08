
import React, { useState } from 'react';
import { toast } from 'sonner';
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
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReply,
  onReaction,
  onDelete,
  isLast = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    '👍': Math.floor(Math.random() * 5),
    '❤️': Math.floor(Math.random() * 3),
    '😂': Math.floor(Math.random() * 2),
    '🔥': Math.floor(Math.random() * 3)
  });
  
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(message.id, reaction);
      // Update local state for immediate feedback
      setReactions(prev => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) + 1
      }));
      toast.success(`Added ${reaction} reaction`);
    }
  };
  
  return (
    <div 
      className={`relative px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 group transition-all duration-200 ${isLast ? 'mb-4' : ''} rounded-lg mx-2`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <MessageHeader message={message} />
      
      <MessageContent content={message.content} />
      
      <MessageReactionDisplay 
        reactions={reactions}
        onReactionClick={handleReaction}
        onAddReaction={() => setShowReactions(!showReactions)}
      />
      
      <MessageActions
        messageId={message.id}
        messageContent={message.content}
        showActions={showActions}
        showReactions={showReactions}
        setShowReactions={setShowReactions}
        onReply={onReply}
        onDelete={onDelete}
        onReaction={onReaction}
      />
    </div>
  );
};

export default ChatMessage;
