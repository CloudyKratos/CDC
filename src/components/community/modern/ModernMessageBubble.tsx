
import React from 'react';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import type { Message } from '@/types/chat';

interface ModernMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onSendReply?: (content: string, parentId: string) => Promise<boolean>;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  isThread?: boolean;
  hideActions?: boolean;
  className?: string;
}

// Wrapper component to maintain backward compatibility
export const ModernMessageBubble: React.FC<ModernMessageBubbleProps> = (props) => {
  return <EnhancedModernMessageBubble {...props} />;
};
