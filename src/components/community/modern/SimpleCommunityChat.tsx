
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
  ArrowLeft,
  ChevronDown
} from 'lucide-react';
import { useSimpleChat } from '@/hooks/useSimpleChat';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const channels = [
  { id: 'announcement', name: 'announcement', emoji: '📢', description: 'Important updates and news' },
  { id: 'general', name: 'general', emoji: '💬', description: 'General community discussion' },
  { id: 'morning journey', name: 'morning journey', emoji: '🌅', description: 'Morning reflections and goals' }
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
        <Card className="w-full max-w-md p-8 text-center bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-3 text-gray-900">Join the Community</h3>
          <p className="text-gray-600 leading-relaxed">
            Sign in to participate in community discussions and connect with fellow warriors
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-gray-900 dark:via-blue-950/30 dark:to-purple-950/20">
      {/* Mobile Channel Selector Overlay */}
      {isMobile && showChannelList && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowChannelList(false)}
          />
          <div className="w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-blue-600" />
                Channels
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowChannelList(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-3 space-y-2">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelChange(channel.name)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                    activeChannel === channel.name
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-[1.01]'
                  }`}
                >
                  <div className="text-xl">{channel.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{channel.name}</div>
                    <div className={`text-xs truncate mt-1 ${
                      activeChannel === channel.name ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {channel.description}
                    </div>
                  </div>
                  {activeChannel === channel.name && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-72 bg-white/80 backdrop-blur-sm dark:bg-gray-800/80 border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white">Community Channels</h2>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.name)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                  activeChannel === channel.name
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-[1.01]'
                }`}
              >
                <div className="text-xl">{channel.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{channel.name}</div>
                  <div className={`text-xs truncate mt-1 ${
                    activeChannel === channel.name ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {channel.description}
                  </div>
                </div>
                {activeChannel === channel.name && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white/70 backdrop-blur-sm dark:bg-gray-900/70 shadow-xl">
        {/* Enhanced Mobile Header */}
        {isMobile && (
          <div className="flex items-center justify-between p-4 bg-white/90 backdrop-blur-md dark:bg-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChannelList(true)}
              className="flex items-center gap-2 px-3 py-2 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="h-4 w-4" />
              <span className="text-sm font-medium">Channels</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
            
            <div className="flex items-center gap-3 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg">
              <span className="text-lg">{activeChannelData.emoji}</span>
              <span className="font-semibold text-sm text-gray-900 dark:text-white">{activeChannelData.name}</span>
            </div>
            
            <div className="flex items-center">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs px-2 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                  Live
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs px-2 py-1">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Desktop Header */}
        {!isMobile && (
          <div className="flex items-center justify-between p-6 bg-white/90 backdrop-blur-md dark:bg-gray-800/90 border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl">{activeChannelData.emoji}</span>
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 dark:text-white capitalize">{activeChannelData.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activeChannelData.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isConnected ? (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 px-3 py-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 px-3 py-1">
                  <WifiOff className="h-3 w-3 mr-2" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className={`p-4 space-y-4 ${isMobile ? 'pb-24' : 'pb-6'}`}>
              {isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="text-sm font-medium">Loading messages...</span>
                  </div>
                </div>
              )}

              {!isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium mb-1">No messages yet</p>
                    <p className="text-gray-400 text-sm">Start the conversation!</p>
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
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${
                      showAvatar ? 'mt-6' : 'mt-2'
                    }`}
                  >
                    {showAvatar && (
                      <Avatar className={`flex-shrink-0 ${isMobile ? 'h-8 w-8' : 'h-10 w-10'} ring-2 ring-white shadow-md`}>
                        <AvatarImage src={message.sender?.avatar_url || ''} />
                        <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
                          {(message.sender?.full_name || message.sender?.username || 'U')[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {!showAvatar && <div className={`${isMobile ? 'w-8' : 'w-10'} flex-shrink-0`} />}
                    
                    <div className={`flex-1 max-w-[85%] ${isMobile ? 'max-w-[75%]' : ''}`}>
                      {showAvatar && (
                        <div className={`flex items-center gap-2 mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className={`font-semibold ${isMobile ? 'text-sm' : 'text-sm'} text-gray-900 dark:text-white`}>
                            {isOwn ? 'You' : (message.sender?.full_name || message.sender?.username || 'Unknown')}
                          </span>
                          <span className={`text-xs text-gray-500 ${isMobile ? 'text-[10px]' : ''}`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      )}
                      
                      <div
                        className={`inline-block px-4 py-3 rounded-2xl max-w-full break-words shadow-sm ${
                          isMobile ? 'px-3 py-2 text-sm' : ''
                        } ${
                          isOwn
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md shadow-lg'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-bl-md text-gray-900 dark:text-white shadow-md'
                        }`}
                      >
                        <p className={`whitespace-pre-wrap leading-relaxed ${isMobile ? 'text-sm' : ''}`}>
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

        {/* Enhanced Message Input */}
        <div className={`bg-white/95 backdrop-blur-md dark:bg-gray-800/95 border-t border-gray-200/50 dark:border-gray-700/50 shadow-lg ${
          isMobile ? 'fixed bottom-0 left-0 right-0 z-40' : 'relative'
        }`}>
          <form onSubmit={handleSendMessage} className="p-4 flex gap-3 items-end">
            <div className="flex-1">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={`Message ${activeChannelData.name}...`}
                disabled={!isConnected}
                className={`min-h-[48px] max-h-[120px] resize-none border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
            
            <div className="flex gap-2">
              {!isMobile && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!isConnected}
                    onClick={() => toast.info('Emoji picker coming soon!')}
                    className="h-12 w-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={!isConnected}
                    onClick={() => toast.info('File sharing coming soon!')}
                    className="h-12 w-12 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                type="submit"
                disabled={!messageText.trim() || !isConnected}
                size={isMobile ? "sm" : "default"}
                className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                  isMobile ? 'h-12 w-12 p-0' : 'h-12 px-6'
                }`}
              >
                <Send className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                {!isMobile && <span className="ml-2 font-medium">Send</span>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
