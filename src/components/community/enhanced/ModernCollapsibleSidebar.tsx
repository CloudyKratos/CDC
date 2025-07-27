
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronRight, 
  Hash, 
  Users, 
  Settings,
  Search,
  Plus,
  Bell,
  Calendar,
  Volume2,
  ChevronDown,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  unreadCount?: number;
  isPinned?: boolean;
}

interface ModernCollapsibleSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  channels: Channel[];
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  isConnected: boolean;
  className?: string;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return Bell;
    case 'morning journey':
      return Calendar;
    case 'voice':
      return Volume2;
    default:
      return Hash;
  }
};

const getChannelColor = (channelName: string) => {
  switch (channelName) {
    case 'announcement':
      return 'text-orange-500';
    case 'morning journey':
      return 'text-green-500';
    case 'voice':
      return 'text-purple-500';
    default:
      return 'text-blue-500';
  }
};

export const ModernCollapsibleSidebar: React.FC<ModernCollapsibleSidebarProps> = ({
  isCollapsed,
  onToggle,
  channels,
  activeChannel,
  onChannelSelect,
  isConnected,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelsExpanded, setChannelsExpanded] = useState(true);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-r border-slate-200/60 dark:border-slate-700/60 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
      isCollapsed ? "w-16" : "w-72",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Hash className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Channels
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-7 w-7 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Connection Status */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )} />
            <span className={cn(
              "font-medium",
              isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400"
            />
          </div>
        </div>
      )}

      {/* Channels List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {!isCollapsed && (
            <div className="mb-2">
              <Button
                variant="ghost"
                onClick={() => setChannelsExpanded(!channelsExpanded)}
                className="w-full justify-start h-8 px-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {channelsExpanded ? (
                  <ChevronDown className="h-3 w-3 mr-2" />
                ) : (
                  <ChevronRightIcon className="h-3 w-3 mr-2" />
                )}
                CHANNELS
                <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700">
                  {filteredChannels.length}
                </Badge>
              </Button>
            </div>
          )}

          {(channelsExpanded || isCollapsed) && (
            <div className="space-y-1">
              {filteredChannels.map((channel) => {
                const ChannelIcon = getChannelIcon(channel.name);
                const isActive = activeChannel === channel.name;

                return (
                  <Button
                    key={channel.id}
                    variant={isActive ? "secondary" : "ghost"}
                    onClick={() => onChannelSelect(channel.name)}
                    className={cn(
                      "w-full justify-start h-auto p-3 transition-all duration-200 rounded-lg",
                      isCollapsed ? "px-2 py-3" : "px-3 py-2",
                      isActive 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800 shadow-sm" 
                        : "hover:bg-slate-200/60 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <ChannelIcon className={cn(
                        "h-4 w-4 flex-shrink-0",
                        isActive ? "text-blue-600 dark:text-blue-400" : getChannelColor(channel.name)
                      )} />
                      
                      {!isCollapsed && (
                        <>
                          <div className="flex flex-col items-start min-w-0 flex-1">
                            <span className="text-sm font-medium truncate w-full">
                              {channel.name}
                            </span>
                            {channel.description && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">
                                {channel.description}
                              </span>
                            )}
                          </div>
                          
                          {channel.unreadCount && channel.unreadCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto text-xs px-2 py-0.5 bg-blue-600 text-white min-w-[20px] h-5 flex items-center justify-center rounded-full"
                            >
                              {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Add Channel Button */}
          {!isCollapsed && (
            <div className="mt-4 px-1">
              <Button
                variant="ghost"
                className="w-full justify-start h-8 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/60 bg-slate-100/50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>Community Chat</span>
            </div>
            <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full">
              {filteredChannels.length} channels
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
