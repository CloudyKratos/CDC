
import React from 'react';
import { Hash, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatChannel } from '@/types/chat';

interface ChannelNavigatorProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  isCollapsed?: boolean;
}

export const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isCollapsed = false
}) => {
  const getChannelIcon = (channelName: string) => {
    switch (channelName) {
      case 'morning journey':
        return '🌅';
      case 'announcement':
        return '📢';
      case 'general':
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getChannelTheme = (channelName: string) => {
    switch (channelName) {
      case 'morning journey':
        return {
          gradient: 'from-orange-500/10 to-yellow-500/10',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-300',
          active: 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white',
          hover: 'hover:bg-orange-50 dark:hover:bg-orange-900/20'
        };
      case 'announcement':
        return {
          gradient: 'from-blue-500/10 to-indigo-500/10',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          active: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white',
          hover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
        };
      case 'general':
      default:
        return {
          gradient: 'from-gray-500/10 to-slate-500/10',
          border: 'border-gray-200 dark:border-gray-700',
          text: 'text-gray-700 dark:text-gray-300',
          active: 'bg-gradient-to-r from-gray-600 to-slate-600 text-white',
          hover: 'hover:bg-gray-50 dark:hover:bg-gray-800'
        };
    }
  };

  const getChannelDescription = (channelName: string) => {
    switch (channelName) {
      case 'morning journey':
        return 'Start your day with motivation';
      case 'announcement':
        return 'Important updates & news';
      case 'general':
      default:
        return 'General community chat';
    }
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-80'} 
      h-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 
      border-r border-gray-200 dark:border-gray-700 
      transition-all duration-300 ease-in-out
      flex flex-col
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed ? (
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Channels
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connect with the community
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Hash className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </div>
        )}
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {channels.map((channel) => {
            const isActive = activeChannel === channel.name;
            const theme = getChannelTheme(channel.name);
            const icon = getChannelIcon(channel.name);
            const description = getChannelDescription(channel.name);

            return (
              <Button
                key={channel.id}
                variant="ghost"
                onClick={() => onChannelSelect(channel.name)}
                className={`
                  w-full justify-start p-3 h-auto transition-all duration-200
                  ${isActive 
                    ? `${theme.active} shadow-lg transform scale-[1.02]`
                    : `${theme.gradient} ${theme.border} border ${theme.text} ${theme.hover}`
                  }
                  ${isCollapsed ? 'px-2' : ''}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}>
                    {typeof icon === 'string' ? (
                      <span className="text-lg">{icon}</span>
                    ) : (
                      icon
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-medium capitalize text-sm">
                        {channel.name}
                      </div>
                      <div className={`text-xs mt-0.5 ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {description}
                      </div>
                    </div>
                  )}
                  
                  {!isCollapsed && isActive && (
                    <ChevronRight className="h-4 w-4 text-white/80" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Chat</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
