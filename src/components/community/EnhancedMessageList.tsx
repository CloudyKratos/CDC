
import React, { useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Message } from '@/types/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EnhancedModernMessageBubble } from './modern/EnhancedModernMessageBubble';
import { MessageSquare, Loader2, Sparkles } from 'lucide-react';

interface EnhancedMessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onDeleteMessage: (messageId: string) => void;
  className?: string;
}

const EnhancedMessageList: React.FC<EnhancedMessageListProps> = ({
  messages,
  isLoading = false,
  onDeleteMessage,
  className = ''
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDeleteMessage = async (messageId: string) => {
    await onDeleteMessage(messageId);
  };

  if (isLoading && messages.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="flex items-center gap-4 text-blue-600 dark:text-blue-400">
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
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to chat?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            This is the beginning of your conversation. Share your thoughts, ask questions, or just say hello!
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>Your message will appear here instantly</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className={`h-full ${className}`} ref={scrollAreaRef}>
      <div className="p-6 space-y-6">
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
              className={`animate-fade-in ${
                isLastInGroup ? 'mb-2' : 'mb-1'
              }`}
            >
              <EnhancedModernMessageBubble
                message={message}
                isOwn={message.sender_id === user?.id}
                onDelete={handleDeleteMessage}
                showAvatar={!isConsecutive}
                isConsecutive={isConsecutive}
                isConnected={true}
                className="hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-all duration-200 rounded-xl p-2 -m-2"
              />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Gradient overlay for smooth scrolling effect */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-slate-900 dark:via-slate-900/50 pointer-events-none" />
    </ScrollArea>
  );
};

export default EnhancedMessageList;
