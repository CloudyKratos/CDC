
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
import { Send, Hash, Users, Wifi, WifiOff, RefreshCw, Smile, MoreHorizontal, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedCommunityChatProps {
  defaultChannel?: string;
}

const EnhancedCommunityChat: React.FC<EnhancedCommunityChatProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  // Handle sending messages with better error handling
  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending || !user?.id) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      const success = await sendMessage(messageToSend);
      if (success) {
        // Focus back to input after successful send
        setTimeout(() => inputRef.current?.focus(), 100);
      } else {
        // Restore message if send failed
        setMessage(messageToSend);
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Send error:', error);
      setMessage(messageToSend);
      toast.error('Failed to send message. Please try again.');
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

  // Connection status with better visual feedback
  const connectionStatus = useMemo(() => {
    if (isLoading) return { 
      icon: RefreshCw, 
      color: 'text-blue-500', 
      label: 'Connecting...', 
      spin: true,
      bgColor: 'bg-blue-50 border-blue-200'
    };
    if (!isConnected || error) return { 
      icon: WifiOff, 
      color: 'text-red-500', 
      label: 'Disconnected', 
      spin: false,
      bgColor: 'bg-red-50 border-red-200'
    };
    return { 
      icon: Wifi, 
      color: 'text-green-500', 
      label: 'Live', 
      spin: false,
      bgColor: 'bg-green-50 border-green-200'
    };
  }, [isLoading, isConnected, error]);

  // Group consecutive messages from same user with time consideration
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
      <Card className="h-full max-h-[600px] flex flex-col border-2 border-dashed border-gray-200">
        <CardContent className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto">
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Join the Conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Sign in to connect with the community and share your thoughts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full max-h-[600px] flex flex-col shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <CardHeader className="pb-3 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Hash className="h-4 w-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {defaultChannel}
                </span>
                <div className="text-xs text-gray-500 font-normal">
                  {messages.length} messages
                </div>
              </div>
            </div>
          </CardTitle>
          
          <div className="flex items-center gap-3">
            <Badge 
              variant="outline" 
              className={`${connectionStatus.bgColor} ${connectionStatus.color} border-current`}
            >
              <connectionStatus.icon 
                className={`h-3 w-3 mr-1 ${connectionStatus.spin ? 'animate-spin' : ''}`} 
              />
              {connectionStatus.label}
            </Badge>
            
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Community</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Enhanced Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden bg-white/50 dark:bg-gray-900/50">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-center">
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Retry Connection
                </Button>
              </div>
            )}

            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3 text-gray-500">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="font-medium">Loading messages...</span>
                </div>
              </div>
            ) : groupedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
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
                    <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white shadow-lg">
                      <AvatarImage src={avatar || ''} alt={senderName} />
                      <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {senderName[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex-1 space-y-2 ${isOwn ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-3 ${isOwn ? 'justify-end' : ''}`}>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {isOwn ? 'You' : senderName}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(group.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {group.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`inline-block px-4 py-3 rounded-2xl max-w-xs sm:max-w-md lg:max-w-lg shadow-md ${
                            isOwn
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md border border-gray-200 dark:border-gray-600'
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

      {/* Enhanced Message Input */}
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message #${defaultChannel}...`}
              disabled={!isConnected || isSending}
              className="pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 bg-white dark:bg-gray-800"
              maxLength={1000}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
            
            {message.length > 900 && (
              <div className="absolute -top-8 right-0 text-xs text-gray-500">
                {message.length}/1000
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || !isConnected || isSending}
            size="default"
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
          >
            {isSending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2 text-center font-medium">
            Connection lost - messages will be sent when connection is restored
          </p>
        )}
        
        {isConnected && (
          <p className="text-xs text-green-600 mt-2 text-center">
            <Wifi className="inline h-3 w-3 mr-1" />
            Real-time chat active
          </p>
        )}
      </div>
    </Card>
  );
};

export default EnhancedCommunityChat;
