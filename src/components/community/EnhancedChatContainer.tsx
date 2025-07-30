
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MessageCircle, 
  Users, 
  Settings, 
  Hash,
  Wifi,
  WifiOff,
  RefreshCw,
  Volume2,
  Bell,
  Search
} from 'lucide-react';
import { useChatManager } from '@/hooks/useChatManager';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedMessageList } from './EnhancedMessageList';
import EnhancedMessageInput from './input/EnhancedMessageInput';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
}

const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  defaultChannel = 'general'
}) => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState(defaultChannel);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    deleteMessage,
    reconnect,
    isSending
  } = useChatManager(selectedChannel);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim()) return false;
    return await sendMessage(content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
    toast.success('Message deleted');
  };

  const handleReconnect = () => {
    reconnect();
    toast.info('Reconnecting...');
  };

  const channels = ['general', 'random', 'help'];

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to Community Chat</h3>
              <p className="text-muted-foreground">Sign in to join the conversation</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden border-0 shadow-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Header */}
      <CardHeader className="pb-3 border-b border-border/50 bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                "bg-primary/10 text-primary"
              )}>
                <Hash className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {selectedChannel}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{messages.length} messages</span>
                  <Separator orientation="vertical" className="h-3" />
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-destructive" />
                        <span className="text-destructive">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
            </Button>
            {!isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReconnect}
                className="h-8 px-3 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reconnect
              </Button>
            )}
          </div>
        </div>

        {/* Channel Selection */}
        <div className="flex gap-2 mt-3">
          {channels.map((channel) => (
            <Button
              key={channel}
              variant={selectedChannel === channel ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedChannel(channel)}
              className={cn(
                "h-8 px-3 text-xs rounded-full transition-all duration-200",
                selectedChannel === channel 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Hash className="h-3 w-3 mr-1" />
              {channel}
            </Button>
          ))}
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {error && (
          <div className="p-4 bg-destructive/10 border-b border-destructive/20">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <WifiOff className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <ScrollArea className="h-full">
          <div className="min-h-full flex flex-col">
            {/* Loading state */}
            {isLoading && messages.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1">
              <EnhancedMessageList
                messages={messages}
                onDeleteMessage={handleDeleteMessage}
                isLoading={isLoading && messages.length > 0}
              />
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <EnhancedMessageInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isConnected={isConnected}
        isSending={isSending}
        activeChannel={selectedChannel}
        disabled={!isConnected}
      />
    </Card>
  );
};

export default EnhancedChatContainer;
