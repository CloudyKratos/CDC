
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
  const baseClasses = "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-300 group relative overflow-hidden";
  
  if (isActive) {
    switch (channelName) {
      case 'announcement':
        return `${baseClasses} bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800 shadow-lg shadow-blue-100 dark:shadow-blue-950/20`;
      case 'morning journey':
        return `${baseClasses} bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30 text-orange-700 dark:text-orange-300 border-2 border-orange-200 dark:border-orange-800 shadow-lg shadow-orange-100 dark:shadow-orange-950/20`;
      case 'general':
      default:
        return `${baseClasses} bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-600 shadow-lg shadow-gray-100 dark:shadow-gray-950/20`;
    }
  }
  
  return `${baseClasses} text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md`;
};

const getChannelDescription = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return 'Important updates and news';
    case 'morning journey':
      return 'Daily motivation and routines';
    case 'general':
    default:
      return 'General community discussion';
  }
};

export const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isCollapsed = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 ${isCollapsed ? 'w-16' : 'w-72'} transition-all duration-300 flex flex-col`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg">
            <Users className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                Community
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Connect with others
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Channels */}
      <div className="flex-1 p-4 space-y-2">
        <div className={`text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 ${isCollapsed ? 'hidden' : 'px-3'}`}>
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
              {/* Background glow effect for active channel */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
              
              <div className="relative z-10 flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-white/50 dark:bg-black/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'} transition-colors duration-200`}>
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                </div>
                
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-semibold text-sm capitalize truncate">
                      {channel.name}
                    </div>
                    <div className="text-xs opacity-75 truncate leading-tight">
                      {channel.description || getChannelDescription(channel.name)}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Active indicator */}
              {isActive && !isCollapsed && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-current rounded-full opacity-60" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Footer info */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <span className="font-medium">{channels.length}</span> channels available
          </div>
        </div>
      )}
    </div>
  );
};
