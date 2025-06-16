
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityChat } from '@/hooks/use-community-chat';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Hash, Users, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface EnhancedCommunityChatProps {
  channelName?: string;
}

const EnhancedCommunityChat: React.FC<EnhancedCommunityChatProps> = ({ 
  channelName = 'general' 
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuth();
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    deleteMessage
  } = useCommunityChat(channelName);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !user?.id) {
      if (!user?.id) {
        toast.error('Please log in to send messages');
      }
      return;
    }

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(false);

    try {
      await sendMessage(messageToSend);
      toast.success('Message sent!', { duration: 1000 });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Restore message to input on failure
      setInputMessage(messageToSend);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <Card className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Community</h3>
          <p className="text-gray-600">Please log in to participate in the community chat.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold capitalize">{channelName}</h3>
          <Badge variant="secondary" className="ml-2">
            {messages.length} messages
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {navigator.onLine ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm text-gray-500">
            {navigator.onLine ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32 text-red-500">
            <p>Error loading messages: {error}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <p>No messages yet. Be the first to say hello! 👋</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage src={message.sender?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(message.sender?.full_name || message.sender?.username || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {message.sender?.full_name || message.sender?.username || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                    {message.sender_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputMessage}
            onChange={handleInputChange}
            placeholder={`Message #${channelName}...`}
            className="flex-1"
            disabled={isLoading || !navigator.onLine}
            maxLength={500}
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputMessage.trim() || isLoading || !navigator.onLine}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        {isTyping && (
          <p className="text-xs text-gray-500 mt-1">
            {inputMessage.length}/500 characters
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedCommunityChat;
