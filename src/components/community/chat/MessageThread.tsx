import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Send } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { useEnhancedMessageActions } from '@/hooks/use-enhanced-message-actions';
import { Message } from '@/types/chat';

interface MessageThreadProps {
  parentMessage: Message;
  channelId: string;
  isOpen: boolean;
  onClose: () => void;
  onReact?: (messageId: string, emoji: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  parentMessage,
  channelId,
  isOpen,
  onClose,
  onReact
}) => {
  const [replies, setReplies] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { replyToMessage, fetchMessageReplies } = useEnhancedMessageActions();

  // Load replies when thread opens
  useEffect(() => {
    if (isOpen && parentMessage.id) {
      loadReplies();
    }
  }, [isOpen, parentMessage.id]);

  const loadReplies = async () => {
    setIsLoading(true);
    try {
      const fetchedReplies = await fetchMessageReplies(parentMessage.id);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error('Failed to load replies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || isSending) return;
    
    setIsSending(true);
    try {
      const success = await replyToMessage(parentMessage.id, replyText.trim(), channelId);
      if (success) {
        setReplyText('');
        await loadReplies(); // Reload replies to show the new one
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center justify-between">
            <span>Thread</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          {/* Parent Message */}
          <div className="border-l-2 border-primary pl-3 mx-4 mt-4">
            <EnhancedMessageBubble
              message={parentMessage}
              isOwn={false}
              showAvatar={true}
              isConsecutive={false}
              onReact={onReact}
            />
          </div>
          
          {/* Replies */}
          <div className="px-4 space-y-2 mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : replies.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p className="text-sm">No replies yet</p>
                <p className="text-xs">Be the first to reply!</p>
              </div>
            ) : (
              replies.map((reply, index) => (
                <EnhancedMessageBubble
                  key={reply.id}
                  message={reply}
                  isOwn={false}
                  showAvatar={index === 0 || replies[index - 1].sender_id !== reply.sender_id}
                  isConsecutive={index > 0 && replies[index - 1].sender_id === reply.sender_id}
                  onReact={onReact}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Reply Input */}
        <div className="border-t p-4">
          <div className="space-y-2">
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Reply to thread... (Ctrl+Enter to send)"
              className="min-h-[80px] resize-none"
              disabled={isSending}
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSendReply} 
                disabled={!replyText.trim() || isSending}
                size="sm"
              >
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Reply
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};