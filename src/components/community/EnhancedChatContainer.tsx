
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Hash,
  Wifi,
  WifiOff,
  RefreshCw,
  Users,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useImprovedChat } from '@/hooks/use-improved-chat';
import { MessageContent } from './message/MessageContent';
import EnhancedMessageInput from './input/EnhancedMessageInput';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
}

const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  defaultChannel = 'general'
}) => {
  const { user } = useAuth();
  const [selectedChannel, setSelectedChannel] = useState(defaultChannel);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    isSending,
    isConnected,
    isReconnecting,
    error,
    sendMessage,
    deleteMessage,
    reconnect
  } = useImprovedChat(selectedChannel);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    return await sendMessage(content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId);
  };

  const channels = ['general', 'random', 'help'];

  if (!user) {
    return (
      <Card className="h-full flex items-center justify-center">
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Hash className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Community Chat</h3>
            <p className="text-muted-foreground">Sign in to join the conversation</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 shadow-sm">
      {/* Header */}
      <CardHeader className="pb-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Hash className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{selectedChannel}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{messages.length} messages</span>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1">
                  {isConnected ? (
                    <>
                      <Wifi className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">
                        {isReconnecting ? 'Reconnecting...' : 'Disconnected'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {!isConnected && !isReconnecting && (
            <Button
              variant="outline"
              size="sm"
              onClick={reconnect}
              className="h-8"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reconnect
            </Button>
          )}
        </div>

        {/* Channel tabs */}
        <div className="flex gap-1 mt-3">
          {channels.map((channel) => (
            <Button
              key={channel}
              variant={selectedChannel === channel ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedChannel(channel)}
              className={cn(
                "h-7 px-3 text-xs rounded-full",
                selectedChannel === channel 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {channel}
            </Button>
          ))}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {error && (
          <Alert className="mx-4 mt-4 border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <ScrollArea className="h-full">
          {isLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"></div>
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <MessageContent
                  key={message.id}
                  message={message}
                  onDelete={handleDeleteMessage}
                  onReply={() => {}} // TODO: Implement reply functionality
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <EnhancedMessageInput
        onSendMessage={handleSendMessage}
        disabled={!isConnected || isSending}
        isLoading={isSending}
        placeholder={
          isConnected 
            ? `Message #${selectedChannel}...` 
            : 'Reconnecting...'
        }
      />
    </Card>
  );
};

export default EnhancedChatContainer;
