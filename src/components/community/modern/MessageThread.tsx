
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ModernMessageBubble } from './ModernMessageBubble';
import { ModernMessageInput } from './ModernMessageInput';
import type { Message } from '@/types/chat';

interface MessageThreadProps {
  parentMessage: Message;
  replies: Message[];
  onSendReply: (content: string, parentId: string) => Promise<boolean>;
  isConnected: boolean;
  className?: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  parentMessage,
  replies,
  onSendReply,
  isConnected,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    const success = await onSendReply(replyText.trim(), parentMessage.id);
    if (success) {
      setReplyText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 ${className}`}
        >
          <MessageSquare className="h-3 w-3 mr-1" />
          {replies.length > 0 ? `${replies.length} replies` : 'Reply'}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Thread</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Parent Message */}
          <div className="border-l-2 border-blue-500 pl-3">
            <ModernMessageBubble
              message={parentMessage}
              isOwn={false}
              showAvatar={true}
              isConsecutive={false}
              hideActions={true}
            />
          </div>
          
          {/* Replies */}
          <div className="space-y-2">
            {replies.map((reply, index) => (
              <ModernMessageBubble
                key={reply.id}
                message={reply}
                isOwn={false}
                showAvatar={index === 0 || replies[index - 1].sender_id !== reply.sender_id}
                isConsecutive={index > 0 && replies[index - 1].sender_id === reply.sender_id}
                isThread={true}
              />
            ))}
          </div>
        </div>
        
        {/* Reply Input */}
        <div className="border-t">
          <ModernMessageInput
            value={replyText}
            onChange={setReplyText}
            onSend={handleSendReply}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            placeholder="Reply to thread..."
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
