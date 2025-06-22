
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityMessages } from '@/hooks/use-community-messages';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Send, 
  Hash, 
  Lock, 
  Users, 
  Settings, 
  Smile,
  Paperclip,
  Reply,
  Pin,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ChannelSidebar from './ChannelSidebar';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const CommunityChat: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  } = useCommunityMessages(selectedChannel);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <CardContent className="text-center space-y-4">
            <Hash className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">Join the Community</h3>
            <p className="text-muted-foreground">
              Sign in to access community channels and chat with other members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-background">
      {/* Channel Sidebar */}
      <ChannelSidebar
        selectedChannel={selectedChannel}
        onChannelSelect={setSelectedChannel}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-muted-foreground" />
                <h2 className="font-semibold text-lg">{selectedChannel}</h2>
                {!isConnected && (
                  <Badge variant="secondary" className="text-xs">
                    Reconnecting...
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">Online</span>
              </Badge>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  Loading messages...
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8">
                <Hash className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Welcome to #{selectedChannel}</h3>
                <p className="text-muted-foreground">
                  This is the beginning of the #{selectedChannel} channel.
                </p>
              </div>
            ) : (
              messages.map((message, index) => {
                const previousMessage = messages[index - 1];
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    previousMessage={previousMessage}
                    isLast={index === messages.length - 1}
                    onReply={(messageId) => console.log('Reply to:', messageId)}
                    onReaction={(messageId, reaction) => console.log('React:', messageId, reaction)}
                    onDelete={(messageId) => console.log('Delete:', messageId)}
                  />
                );
              })
            )}
            
            {/* Typing Indicator */}
            <TypingIndicator channelId={channelId} />
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t bg-background p-4">
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder={`Message #${selectedChannel}`}
            channelId={channelId}
          />
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;
