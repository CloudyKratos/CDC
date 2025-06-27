
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Hash, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useChatManager } from '@/hooks/useChatManager';
import { toast } from 'sonner';

interface EnhancedCommunityChatProps {
  defaultChannel?: string;
}

const EnhancedCommunityChat: React.FC<EnhancedCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  const {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    isSending,
    error,
    reconnect
  } = useChatManager(activeChannel);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isSending) return;

    try {
      await sendMessage(currentMessage);
      setCurrentMessage('');
    } catch (error) {
      // Error already handled in useChatManager
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Channel switching
  const channels = [
    { id: 'general', name: 'general', emoji: '💬' },
    { id: 'announcements', name: 'announcements', emoji: '📢' },
    { id: 'entrepreneurs', name: 'entrepreneurs', emoji: '🚀' },
    { id: 'tech-talk', name: 'tech-talk', emoji: '💻' },
    { id: 'motivation', name: 'motivation', emoji: '💪' }
  ];

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center p-8">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in to join the chat
            </h3>
            <p className="text-gray-600">
              You need to be signed in to participate in community discussions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
      {/* Header with Channel Selector */}
      <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Hash className="h-5 w-5 text-blue-500" />
            <select
              value={activeChannel}
              onChange={(e) => setActiveChannel(e.target.value)}
              className="bg-transparent text-lg font-semibold text-gray-900 dark:text-white border-none outline-none cursor-pointer"
            >
              {channels.map(channel => (
                <option key={channel.id} value={channel.name}>
                  {channel.emoji} {channel.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
              
              {/* Message Count */}
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Users className="h-3 w-3 mr-1" />
                {messages.length}
              </Badge>
            </div>

            {/* Reconnect Button */}
            {error && (
              <Button
                onClick={reconnect}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-gray-600">Loading chat...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-red-600 mb-3">Connection failed</p>
              <Button onClick={reconnect} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-gray-500">
              <MessageCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No messages yet</p>
              <p className="text-sm">Be the first to start the conversation!</p>
            </div>
          </div>
        ) : (
          /* Messages List */
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            const senderName = message.sender?.full_name || 
                             message.sender?.username || 
                             'Unknown User';
            const avatar = message.sender?.avatar_url;

            return (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={avatar || ''} alt={senderName} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                    {senderName[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-xs lg:max-w-md ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {isOwn ? 'You' : senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div
                    className={`inline-block px-3 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message #${activeChannel}...`}
            disabled={!isConnected || isSending}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!currentMessage.trim() || !isConnected || isSending}
            size="sm"
            className="px-4"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {!isConnected && (
          <p className="text-xs text-red-600 mt-2">
            Reconnecting to chat...
          </p>
        )}
      </div>
    </div>
  );
};

export default EnhancedCommunityChat;
