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
    <div className="bg-card border-b border-border">
      {/* Current Channel Display */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{currentChannel?.icon}</span>
          <div>
            <h1 className="font-semibold text-lg">{currentChannel?.name}</h1>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isConnected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
              )}></div>
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSearch}
          className="h-8 w-8 p-0"
        >
          {showSearch ? (
            <X className="h-4 w-4" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Interface */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 overflow-hidden"
          >
            <ImprovedMessageSearch
              channelId={channelId}
              onMessageSelect={handleMessageSelect}
              onClose={() => setShowSearch(false)}
              placeholder={`Search in ${currentChannel?.name}...`}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Channel Tabs */}
      <div className="px-2 pb-2">
        <div className="flex space-x-1 bg-muted/50 rounded-lg p-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelChange(channel.id)}
              className={cn(
                "flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all",
                activeChannel === channel.id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              <span className="text-base">{channel.icon}</span>
              <span className="hidden sm:inline">{channel.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};