
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Hash, 
  Send, 
  Menu, 
  X, 
  Users, 
  Wifi, 
  WifiOff,
  MessageSquare,
  Smile,
  Paperclip,
  ArrowLeft
} from 'lucide-react';
import { useSimpleChat } from '@/hooks/useSimpleChat';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const channels = [
  { id: 'announcement', name: 'announcement', emoji: '📢', description: 'Important updates' },
  { id: 'general', name: 'general', emoji: '💬', description: 'General discussion' },
  { id: 'morning journey', name: 'morning journey', emoji: '🌅', description: 'Morning reflections' }
];

export const SimpleCommunityChat: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [activeChannel, setActiveChannel] = useState('general');
  const [showChannelList, setShowChannelList] = useState(false);
  const [messageText, setMessageText] = useState('');
  
  const { messages, isLoading, isConnected, sendMessage, error } = useSimpleChat(activeChannel);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !isConnected) return;

    const success = await sendMessage(messageText.trim());
    if (success) {
      setMessageText('');
    }
  };

  const handleChannelChange = (channelName: string) => {
    setActiveChannel(channelName);
    setShowChannelList(false);
  };

  const activeChannelData = channels.find(c => c.name === activeChannel) || channels[0];

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Card className="w-full max-w-md p-6 text-center">
          <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to participate in community discussions
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gray-50 dark:bg-gray-900">
      {/* Mobile Channel Overlay */}
      {isMobile && showChannelList && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black/50"
            onClick={() => setShowChannelList(false)}
          />
          <div className="w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Channels</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChannelList(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.name)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    activeChannel === channel.name
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">{channel.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{channel.name}</div>
                    <div className={`text-xs truncate ${
                      activeChannel === channel.name ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {channel.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <h2 className="font-semibold">Channels</h2>
            </div>
          </div>
          <div className="p-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeChannel === channel.name
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{channel.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{channel.name}</div>
                  <div className={`text-xs truncate ${
                    activeChannel === channel.name ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {channel.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChannelList(true)}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm">Channels</span>
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-lg">{activeChannelData.emoji}</span>
              <span className="font-semibold text-sm">{activeChannelData.name}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200 text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-xl">{activeChannelData.emoji}</span>
              <div>
                <h3 className="font-semibold capitalize">{activeChannelData.name}</h3>
                <p className="text-sm text-gray-500">{activeChannelData.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Wifi className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className={`p-3 space-y-3 ${isMobile ? 'pb-20' : 'pb-4'}`}>
              {isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm">Loading messages...</span>
                  </div>
                </div>
              )}

              {!isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs">Start the conversation!</p>
                  </div>
                </div>
              )}

              {messages.map((message, index) => {
                const isOwn = message.sender_id === user.id;
                const prevMessage = messages[index - 1];
                const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    {showAvatar && (
                      <Avatar className={`h-8 w-8 flex-shrink-0 ${isMobile ? 'h-7 w-7' : ''}`}>
                        <AvatarImage src={message.sender?.avatar_url || ''} />
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {(message.sender?.full_name || message.sender?.username || 'U')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {!showAvatar && <div className={`${isMobile ? 'w-7' : 'w-8'} flex-shrink-0`} />}
                    
                    <div className={`flex-1 max-w-[85%] ${isMobile ? 'max-w-[75%]' : ''}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-sm font-medium ${isMobile ? 'text-xs' : ''}`}>
                            {isOwn ? 'You' : (message.sender?.full_name || message.sender?.username || 'Unknown')}
                          </span>
                          <span className={`text-xs text-gray-500 ${isMobile ? 'text-[10px]' : ''}`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`inline-block px-3 py-2 rounded-lg max-w-full break-words ${
                          isMobile ? 'px-2 py-1.5 text-sm' : ''
                        } ${
                          isOwn
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-bl-sm'
                        }`}
                      >
                        <p className={`whitespace-pre-wrap ${isMobile ? 'text-sm leading-relaxed' : ''}`}>
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Message Input */}
        <div className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${
          isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : 'relative'
        }`}>
          <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
            <div className="flex-1">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${activeChannelData.name}...`}
                disabled={!isConnected}
                className={`min-h-[40px] max-h-[120px] resize-none ${
                  isMobile ? 'text-base' : ''
                }`}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e as any);
                  }
                }}
              />
            </div>
            
            <div className="flex gap-1">
              {!isMobile && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!isConnected}
                    onClick={() => toast.info('Emoji picker coming soon!')}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!isConnected}
                    onClick={() => toast.info('File sharing coming soon!')}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                type="submit"
                disabled={!messageText.trim() || !isConnected}
                size={isMobile ? "sm" : "default"}
                className={isMobile ? "px-3" : ""}
              >
                <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                {!isMobile && <span className="ml-2">Send</span>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
