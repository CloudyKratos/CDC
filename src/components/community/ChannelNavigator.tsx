
import React from 'react';
import { Hash, Bell, Sun, Users } from 'lucide-react';
import { ChatChannel } from '@/types/chat';

interface ChannelNavigatorProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  isCollapsed?: boolean;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return Bell;
    case 'morning journey':
      return Sun;
    case 'general':
    default:
      return Hash;
  }
};

const getChannelTheme = (channelName: string, isActive: boolean) => {
  const baseClasses = "flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 group";
  
  if (isActive) {
    switch (channelName) {
      case 'announcement':
        return `${baseClasses} bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800`;
      case 'morning journey':
        return `${baseClasses} bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800`;
      case 'general':
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700`;
    }
  }
  
  return `${baseClasses} text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100`;
};

export const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isCollapsed = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          {!isCollapsed && (
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Community
            </h2>
          )}
        </div>
      </div>
      
      <div className="p-2 space-y-1">
        <div className={`text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${isCollapsed ? 'hidden' : 'px-3 py-2'}`}>
          Channels
        </div>
        
        {channels.map((channel) => {
          const IconComponent = getChannelIcon(channel.name);
          const isActive = activeChannel === channel.name;
          
          return (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.name)}
              className={getChannelTheme(channel.name, isActive)}
              title={isCollapsed ? channel.name : undefined}
            >
              <IconComponent className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <div className="font-medium">
                    {channel.name}
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {channel.description}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
