
import React, { useRef, useEffect, useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { MessageCircle, AlertCircle, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { MessageThread } from './MessageThread';
import { MessageSearch } from './MessageSearch';
import { TypingIndicator } from './TypingIndicator';
import { useEnhancedMessageActions } from '@/hooks/use-enhanced-message-actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessagesListProps {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
  onReconnect: () => void;
  channelId?: string | null;
  onDeleteMessage?: (messageId: string) => Promise<void>;
}

const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  isLoading,
  error,
  onReconnect,
  channelId,
  onDeleteMessage
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [threadMessage, setThreadMessage] = useState<Message | null>(null);
  const [showThread, setShowThread] = useState(false);
  
  const { editMessage, addReaction } = useEnhancedMessageActions();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setThreadMessage(message);
      setShowThread(true);
    }
  };

  const handleOpenThread = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setThreadMessage(message);
      setShowThread(true);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    await addReaction(messageId, emoji);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          <span className="text-gray-600">Loading chat...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 mb-3">Connection failed</p>
          <Button onClick={onReconnect} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center text-gray-500">
          <MessageCircle className="h-8 w-8 mx-auto mb-2" />
          <p>No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`);
    if (messageElement) {
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      messageElement.classList.add('ring-2', 'ring-primary', 'ring-opacity-50');
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-primary', 'ring-opacity-50');
      }, 2000);
    }
  };

  return (
    <>
      {/* Header with Search */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSearch 
            messages={messages}
            onMessageSelect={scrollToMessage}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh messages
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-2">
          {messages.map((message, index) => {
            const isOwn = message.sender_id === user?.id;
            const prevMessage = messages[index - 1];
            const isConsecutive = prevMessage && 
              prevMessage.sender_id === message.sender_id &&
              new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000; // 1 minute

            return (
              <div key={message.id} id={`message-${message.id}`} className="transition-all duration-200">
                <EnhancedMessageBubble
                  message={message}
                  isOwn={isOwn}
                  onDelete={onDeleteMessage}
                  onEdit={editMessage}
                  onReply={handleReply}
                  onReact={handleReact}
                  onOpenThread={handleOpenThread}
                  showAvatar={!isConsecutive}
                  isConsecutive={isConsecutive}
                />
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Typing Indicator */}
        {channelId && (
          <TypingIndicator channelId={channelId} />
        )}
      </div>

      {/* Message Thread */}
      {threadMessage && (
        <MessageThread
          parentMessage={threadMessage}
          channelId={channelId || ''}
          isOpen={showThread}
          onClose={() => setShowThread(false)}
          onReact={handleReact}
        />
      )}
    </>
  );
};

export default MessagesList;
