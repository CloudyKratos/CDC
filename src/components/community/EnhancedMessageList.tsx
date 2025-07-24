
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedMessageBubble } from './enhanced/EnhancedMessageBubble';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface EnhancedMessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onDeleteMessage: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  className?: string;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  isLoading = false,
  onDeleteMessage,
  onReply,
  onReact,
  onPin,
  onReport,
  className = ''
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (isLoading && messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex items-center gap-4 text-primary">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">Loading conversation...</span>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full p-8 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Ready to chat?
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6">
            This is the beginning of your conversation. Share your thoughts, ask questions, or just say hello!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Your message will appear here instantly</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`} ref={scrollAreaRef}>
      <div className="p-6 space-y-2">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const nextMessage = messages[index + 1];
          
          // Group consecutive messages from the same sender within 5 minutes
          const isConsecutive = prevMessage && 
            prevMessage.sender_id === message.sender_id &&
            new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000;
          
          const isLastInGroup = !nextMessage || 
            nextMessage.sender_id !== message.sender_id ||
            new Date(nextMessage.created_at).getTime() - new Date(message.created_at).getTime() > 300000;

          return (
            <div
              key={message.id}
              className={`transition-all duration-200 ${
                isLastInGroup ? 'mb-4' : 'mb-1'
              }`}
            >
              <EnhancedMessageBubble
                message={message}
                isOwn={message.sender_id === user?.id}
                onDelete={onDeleteMessage}
                onReply={onReply}
                onReact={onReact}
                onPin={onPin}
                onReport={onReport}
                showAvatar={!isConsecutive}
                isConsecutive={isConsecutive}
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default EnhancedMessageList;
