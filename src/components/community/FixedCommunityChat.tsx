
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCommunityMessages } from '@/hooks/use-community-messages';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, Hash, Users, Wifi, WifiOff, RefreshCw, Smile, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface FixedCommunityChatProps {
  defaultChannel?: string;
}

const FixedCommunityChat: React.FC<FixedCommunityChatProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  } = useCommunityMessages(defaultChannel);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollToBottom]);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending || !user?.id) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      const success = await sendMessage(messageToSend);
      if (success) {
        setRetryCount(0);
        // Focus back to input after successful send
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        // Restore message if send failed
        setMessage(messageToSend);
        setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessage(messageToSend);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsSending(false);
    }
  }, [message, isSending, user?.id, sendMessage]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Connection status indicator
  const connectionStatus = useMemo(() => {
    if (isLoading) return { icon: RefreshCw, color: 'text-blue-500', label: 'Connecting...', spin: true };
    if (!isConnected) return { icon: WifiOff, color: 'text-red-500', label: 'Disconnected', spin: false };
    return { icon: Wifi, color: 'text-green-500', label: 'Connected', spin: false };
  }, [isLoading, isConnected]);

  // Group consecutive messages from same user
  const groupedMessages = useMemo(() => {
    const groups: Array<{
      sender: any;
      messages: Array<{ id: string; content: string; created_at: string }>;
      timestamp: string;
    }> = [];

    messages.forEach((msg) => {
      const lastGroup = groups[groups.length - 1];
      
      if (lastGroup && lastGroup.sender?.id === msg.sender?.id) {
        // Add to existing group if same sender and within 5 minutes
        const lastMsgTime = new Date(lastGroup.timestamp);
        const currentMsgTime = new Date(msg.created_at);
        const timeDiff = (currentMsgTime.getTime() - lastMsgTime.getTime()) / (1000 * 60);
        
        if (timeDiff <= 5) {
          lastGroup.messages.push({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at
          });
          lastGroup.timestamp = msg.created_at;
          return;
        }
      }
      
      // Create new group
      groups.push({
        sender: msg.sender,
        messages: [{
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at
        }],
        timestamp: msg.created_at
      });
    });

    return groups;
  }, [messages]);

  if (!user) {
    return (
      <Card className="h-full max-h-[600px] flex flex-col">
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Hash className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Join the Community
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sign in to participate in community discussions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full max-h-[600px] flex flex-col shadow-lg">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-blue-500" />
            <span className="text-lg">{defaultChannel}</span>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 text-sm ${connectionStatus.color}`}>
              <connectionStatus.icon 
                className={`h-4 w-4 ${connectionStatus.spin ? 'animate-spin' : ''}`} 
              />
              <span className="hidden sm:inline">{connectionStatus.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-center">
                <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading messages...</span>
                </div>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Start the Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm max-w-md">
                  Be the first to share your thoughts with the community. 
                  Your message could spark an amazing discussion!
                </p>
              </div>
            ) : (
              groupedMessages.map((group, groupIndex) => {
                const isOwn = group.sender?.id === user?.id;
                const senderName = group.sender?.full_name || 
                                 group.sender?.username || 
                                 'Community Member';
                const avatar = group.sender?.avatar_url;

                return (
                  <div key={groupIndex} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={avatar || ''} alt={senderName} />
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 space-y-1 ${isOwn ? 'text-right' : ''}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {isOwn ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(group.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {group.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`inline-block px-3 py-2 rounded-lg max-w-xs sm:max-w-md lg:max-w-lg ${
                            isOwn
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {msg.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${defaultChannel}...`}
              disabled={!isConnected || isSending}
              className="pr-10"
              maxLength={1000}
            />
            {retryCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-8 right-0 text-xs"
              >
                Retry {retryCount}
              </Badge>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected || isSending}
            size="sm"
            className="px-3"
          >
            {isSending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2 text-center">
            Not connected - messages will be sent when connection is restored
          </p>
        )}
      </div>
    </Card>
  );
};

export default FixedCommunityChat;
