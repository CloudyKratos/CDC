
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useSimpleChat } from '../hooks/useSimpleChat';
import { StableCommunityChat } from '../StableCommunityChat';
import { ChatErrorBoundary } from '../ChatErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ModernMessageInput } from './ModernMessageInput';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { ChannelNavigator } from '../ChannelNavigator';
import { useCommunityData } from '../hooks/useCommunityData';
import { 
  Loader2, 
  AlertCircle, 
  Hash,
  Wifi,
  WifiOff,
  MessageSquare,
  Settings,
  Menu
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface SimpleCommunityChatProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityChat: React.FC<SimpleCommunityChatProps> = ({
  channelName: initialChannelName = 'general',
  className = ''
}) => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState(initialChannelName);
  const [messageText, setMessageText] = useState('');
  const [useStableVersion, setUseStableVersion] = useState(false);
  const [showChannelNav, setShowChannelNav] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load channels data
  const { channels, isLoading: channelsLoading, error: channelsError } = useCommunityData();
  
  // Load chat data for active channel
  const chatHookResult = useSimpleChat(activeChannel);
  
  const {
    messages = [],
    isLoading = false,
    error = null,
    isConnected = false,
    sendMessage,
    deleteMessage
  } = chatHookResult ?? {};

  // Auto-switch to stable version on persistent errors
  useEffect(() => {
    if (error && error.includes('Connection') && !useStableVersion) {
      console.log('🔄 Switching to stable chat version due to connection issues');
      setUseStableVersion(true);
    }
  }, [error, useStableVersion]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected || !sendMessage) return;

    const success = await sendMessage(messageText.trim());
    if (success) {
      setMessageText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (deleteMessage) {
      await deleteMessage(messageId);
    }
  };

  const handleChannelSelect = (channelName: string) => {
    console.log('🎯 Switching to channel:', channelName);
    setActiveChannel(channelName);
    setMessageText(''); // Clear input when switching channels
  };

  // Feature flag toggle for debugging
  const toggleVersion = () => {
    setUseStableVersion(!useStableVersion);
  };

  // Render stable version if requested
  if (useStableVersion) {
    return (
      <ChatErrorBoundary>
        <div className="relative h-full flex">
          {/* Channel Navigation */}
          {showChannelNav && (
            <ChannelNavigator
              channels={channels}
              activeChannel={activeChannel}
              onChannelSelect={handleChannelSelect}
              isCollapsed={false}
            />
          )}
          
          {/* Main Chat Area */}
          <div className="flex-1 relative">
            {/* Version toggle button for debugging */}
            <Button
              onClick={toggleVersion}
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2 z-10 opacity-50 hover:opacity-100"
              title="Switch to Original Version"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <StableCommunityChat channelName={activeChannel} className={className} />
          </div>
        </div>
      </ChatErrorBoundary>
    );
  }

  if (!user) {
    return (
      <Card className={`h-full flex flex-col bg-background border-border ${className}`}>
        <CardContent className="flex items-center justify-center h-full p-8">
          <div className="text-center max-w-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Join the conversation
            </h3>
            <p className="text-muted-foreground text-sm">
              Sign in to participate in community discussions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <ChatErrorBoundary
      onError={(error) => {
        console.error('🔴 SimpleCommunityChat error:', error);
        // Auto-switch to stable version on critical errors
        if (error.message.includes('Connection') || error.message.includes('subscription')) {
          setUseStableVersion(true);
        }
      }}
    >
      <div className="h-full flex bg-background">
        {/* Channel Navigation Sidebar */}
        {showChannelNav && (
          <ChannelNavigator
            channels={channels}
            activeChannel={activeChannel}
            onChannelSelect={handleChannelSelect}
            isCollapsed={false}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="h-full flex flex-col bg-background border-border border-l-0 rounded-l-none">
            {/* Clean Header with Channel Info */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile menu toggle */}
                  <Button
                    onClick={() => setShowChannelNav(!showChannelNav)}
                    size="sm"
                    variant="ghost"
                    className="lg:hidden p-1"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <h2 className="font-semibold text-foreground">
                      {activeChannel}
                    </h2>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-sm text-muted-foreground">
                    {messages.length} messages
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      isConnected 
                        ? 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800' 
                        : 'text-muted-foreground bg-muted border-border'
                    }`}
                  >
                    {isConnected ? (
                      <><Wifi className="h-3 w-3 mr-1" />Online</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1" />Offline</>
                    )}
                  </Badge>
                  
                  {/* Version toggle for debugging */}
                  <Button
                    onClick={toggleVersion}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    title="Switch to Stable Version"
                  >
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Error Alert with Auto-Recovery */}
            {(error || channelsError) && (
              <Alert className="m-4 border-destructive/20 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-destructive text-sm flex items-center justify-between">
                  <div>
                    <div className="font-medium">Connection Issue</div>
                    <div>{error || channelsError}</div>
                  </div>
                  <Button
                    onClick={toggleVersion}
                    size="sm"
                    variant="outline"
                    className="ml-2"
                  >
                    Use Stable Version
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="py-2">
                  {/* Loading State */}
                  {(isLoading || channelsLoading) && messages.length === 0 && (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading messages...</span>
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((message, index) => {
                    const prevMessage = messages[index - 1];
                    const isConsecutive = prevMessage && 
                      prevMessage.sender_id === message.sender_id &&
                      new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 300000; // 5 minutes

                    return (
                      <EnhancedModernMessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender_id === user.id}
                        onDelete={handleDeleteMessage}
                        showAvatar={!isConsecutive}
                        isConsecutive={isConsecutive}
                        isConnected={isConnected}
                      />
                    );
                  })}

                  {/* Empty State */}
                  {!isLoading && !channelsLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center max-w-sm">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-sm font-medium text-foreground mb-2">
                          No messages yet
                        </h3>
                        <p className="text-muted-foreground text-xs">
                          Start the conversation in #{activeChannel}
                        </p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="flex-shrink-0 border-t border-border p-4">
              <ModernMessageInput
                value={messageText}
                onChange={setMessageText}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                placeholder={
                  !isConnected 
                    ? "Connecting..." 
                    : `Message #${activeChannel}...`
                }
              />
            </div>
          </Card>
        </div>
      </div>
    </ChatErrorBoundary>
  );
};
