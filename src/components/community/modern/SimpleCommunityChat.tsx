
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
  Menu,
  X
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
  const [isChannelNavCollapsed, setIsChannelNavCollapsed] = useState(false);
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

  console.log('🎛️ SimpleCommunityChat state:', {
    activeChannel,
    channelsCount: channels.length,
    channelNames: channels.map(c => c.name),
    messagesCount: messages.length,
    isConnected,
    showChannelNav
  });

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
    console.log('🎯 Channel selected:', channelName);
    setActiveChannel(channelName);
    setMessageText(''); // Clear input when switching channels
  };

  const toggleChannelNav = () => {
    setShowChannelNav(!showChannelNav);
  };

  const toggleChannelNavCollapse = () => {
    setIsChannelNavCollapsed(!isChannelNavCollapsed);
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
              isCollapsed={isChannelNavCollapsed}
              onToggleCollapse={toggleChannelNavCollapse}
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
            isCollapsed={isChannelNavCollapsed}
            onToggleCollapse={toggleChannelNavCollapse}
          />
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="h-full flex flex-col bg-background border-border border-l-0 rounded-l-none">
            {/* Enhanced Header with Channel Info and Controls */}
            <div className="flex-shrink-0 px-6 py-5 border-b border-border bg-gradient-to-r from-background via-background to-background backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile menu toggle */}
                  <Button
                    onClick={toggleChannelNav}
                    size="sm"
                    variant="ghost"
                    className="lg:hidden p-2 hover-scale rounded-xl"
                    title={showChannelNav ? "Hide Channels" : "Show Channels"}
                  >
                    {showChannelNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </Button>
                  
                  {/* Desktop collapse toggle */}
                  <Button
                    onClick={toggleChannelNavCollapse}
                    size="sm"
                    variant="ghost"
                    className="hidden lg:flex p-2 hover-scale rounded-xl"
                    title={isChannelNavCollapsed ? "Expand Channels" : "Collapse Channels"}
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex items-center gap-3 animate-fade-in">
                    <div className="w-2 h-2 bg-gradient-to-br from-primary to-primary/70 rounded-full animate-pulse"></div>
                    <Hash className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-foreground text-lg tracking-tight">
                      {activeChannel}
                    </h2>
                  </div>
                  <Separator orientation="vertical" className="h-5 bg-border/50" />
                  <span className="text-sm text-muted-foreground font-medium px-2 py-1 bg-muted/50 rounded-lg">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline"
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 ${
                      isConnected 
                        ? 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800 shadow-sm animate-pulse' 
                        : 'text-muted-foreground bg-muted border-border'
                    }`}
                  >
                    {isConnected ? (
                      <><Wifi className="h-3 w-3 mr-1.5" />Live</>
                    ) : (
                      <><WifiOff className="h-3 w-3 mr-1.5" />Offline</>
                    )}
                  </Badge>
                  
                  {/* Version toggle for debugging */}
                  <Button
                    onClick={toggleVersion}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 opacity-50 hover:opacity-100 rounded-lg hover-scale"
                    title="Switch to Stable Version"
                  >
                    <Settings className="h-3.5 w-3.5" />
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

                  {/* Enhanced Empty State */}
                  {!isLoading && !channelsLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center py-24 animate-fade-in">
                      <div className="text-center max-w-sm">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-scale-in">
                          <MessageSquare className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">
                          Start the conversation
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          Be the first to share your thoughts in <span className="font-semibold text-primary">#{activeChannel}</span>
                        </p>
                        <div className="mt-4 w-32 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto rounded-full"></div>
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
