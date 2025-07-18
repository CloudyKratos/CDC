
import React, { useState } from 'react';
import { useCommunityMessages } from '@/hooks/use-community-messages';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Hash, 
  Users, 
  Menu,
  X,
  Send,
  Loader2,
  Calendar,
  Bell,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { EnhancedModernMessageBubble } from './EnhancedModernMessageBubble';
import { cn } from '@/lib/utils';

const CHANNELS = [
  {
    id: 'general',
    name: 'general',
    description: 'General discussion and community chat',
    icon: Hash,
    color: 'bg-blue-500',
    members: 24
  },
  {
    id: 'morning-journey',
    name: 'morning journey',
    description: 'Start your day with motivation and morning routines',
    icon: Calendar,
    color: 'bg-orange-500',
    members: 12
  },
  {
    id: 'announcement',
    name: 'announcement',
    description: 'Important announcements and updates',
    icon: Bell,
    color: 'bg-purple-500',
    members: 45
  }
];

export const SimpleCommunityChat: React.FC = () => {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState('general');
  const [messageText, setMessageText] = useState('');
  const [showChannels, setShowChannels] = useState(false);

  const {
    messages,
    isLoading,
    isConnected,
    error,
    sendMessage,
    channelId
  } = useCommunityMessages(activeChannel);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !isConnected) return;
    
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

  const currentChannel = CHANNELS.find(c => c.id === activeChannel);
  const CurrentIcon = currentChannel?.icon || Hash;

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="p-8 max-w-md text-center shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Join the Community
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect with fellow members in real-time discussions across multiple channels.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4" />
            <span>Chat • Connect • Collaborate</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50/50 via-white to-blue-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "transition-all duration-300 border-r border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
        showChannels ? "w-80" : "w-0 overflow-hidden lg:w-72"
      )}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white text-lg">Community</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {CHANNELS.length} channels
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannels(false)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Channels List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1 mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Text Channels
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700" />
              </div>
              
              {CHANNELS.map((channel) => {
                const IconComponent = channel.icon;
                const isActive = activeChannel === channel.id;
                
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      setActiveChannel(channel.id);
                      setShowChannels(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50 hover:scale-[1.01]"
                    )}
                  >
                    {/* Background decoration */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl" />
                    )}
                    
                    <div className={cn(
                      "relative w-2 h-2 rounded-full flex-shrink-0",
                      isActive ? "bg-white shadow-sm" : channel.color
                    )} />
                    
                    <IconComponent className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors relative",
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )} />
                    
                    <div className="flex-1 min-w-0 relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "font-medium truncate text-sm",
                          isActive ? "text-white" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {channel.name}
                        </span>
                        <Badge 
                          variant={isActive ? "secondary" : "outline"} 
                          className={cn(
                            "text-xs h-5 px-2",
                            isActive 
                              ? "bg-white/20 text-white border-white/30" 
                              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          )}
                        >
                          {channel.members}
                        </Badge>
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {channel.description}
                      </p>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm animate-pulse relative" />
                    )}
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/50 to-blue-50/50 dark:from-gray-800/50 dark:to-gray-700/50">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )} />
              <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannels(true)}
                className="lg:hidden h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", currentChannel?.color)} />
                <CurrentIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentChannel?.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={isConnected ? "default" : "destructive"} 
                className="text-xs h-6 px-2"
              >
                {isConnected ? 'Live' : 'Offline'}
              </Badge>
              <Badge variant="secondary" className="text-xs h-6 px-2">
                {currentChannel?.members} members
              </Badge>
            </div>
          </div>
          
          {currentChannel?.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 ml-8">
              {currentChannel.description}
            </p>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-4">
              {isLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm font-medium">Loading messages...</span>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CurrentIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Welcome to #{currentChannel?.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {currentChannel?.description}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      Be the first to start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const prevMessage = messages[index - 1];
                  const isConsecutive = prevMessage && 
                    prevMessage.sender_id === message.sender_id &&
                    new Date(message.created_at).getTime() - new Date(prevMessage.created_at).getTime() < 60000;

                  return (
                    <EnhancedModernMessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.sender_id === user.id}
                      showAvatar={!isConsecutive}
                      isConsecutive={isConsecutive}
                      isConnected={isConnected}
                    />
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

        {/* Message Input */}
        <div className="p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                placeholder={
                  !isConnected 
                    ? "Reconnecting..." 
                    : `Message #${currentChannel?.name}...`
                }
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || !isConnected}
              className="h-12 w-12 p-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          
          {error && (
            <p className="text-xs text-red-500 mt-2 px-1">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
