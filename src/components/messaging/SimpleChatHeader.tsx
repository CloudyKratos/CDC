import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ImprovedMessageSearch } from '../community/chat/ImprovedMessageSearch';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  icon: string;
}

interface SimpleChatHeaderProps {
  channels: Channel[];
  activeChannel: string;
  onChannelChange: (channelId: string) => void;
  isConnected: boolean;
  channelId?: string;
}

export const SimpleChatHeader: React.FC<SimpleChatHeaderProps> = ({
  channels,
  activeChannel,
  onChannelChange,
  isConnected,
  channelId
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const currentChannel = channels.find(c => c.id === activeChannel);

  const toggleSearch = () => setShowSearch(!showSearch);

  const handleMessageSelect = (messageId: string) => {
    console.log('📍 Navigating to message:', messageId);
    // Here you could implement message navigation/highlighting
    setShowSearch(false);
  };

  return (
    <div className="bg-card border-b-2 border-border/50">
      {/* Current Channel Display - Mobile Optimized */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <span className="text-3xl">{currentChannel?.icon}</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-bold text-xl truncate">{currentChannel?.name}</h1>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
              )}></div>
              <span className="text-xs text-muted-foreground font-medium">
                {isConnected ? 'Live' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Button - Mobile Optimized */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearch}
          className="h-10 w-10 p-0 rounded-full touch-manipulation"
        >
          {showSearch ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Search Interface - Mobile Optimized */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 overflow-hidden border-t border-border/30"
          >
            <div className="pt-3">
              <ImprovedMessageSearch
                channelId={channelId}
                onMessageSelect={handleMessageSelect}
                onClose={() => setShowSearch(false)}
                placeholder={`Search in ${currentChannel?.name}...`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel Tabs - Mobile Optimized */}
      <div className="px-2 pb-3">
        <div className="flex gap-1 bg-muted/30 rounded-xl p-1.5 overflow-x-auto scrollbar-hide">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={cn(
                "flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[80px] touch-manipulation",
                activeChannel === channel.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60 active:scale-95"
              )}
            >
              <span className="text-lg">{channel.icon}</span>
              <span className="hidden xs:inline text-xs">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};