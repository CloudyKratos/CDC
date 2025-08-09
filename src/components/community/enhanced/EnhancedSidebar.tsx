
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Hash, 
  Search, 
  Users, 
  Settings, 
  Plus, 
  Bell, 
  Calendar,
  MessageSquare,
  Star,
  Archive,
  Filter,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { ChatChannel } from '@/types/chat';
import { cn } from '@/lib/utils';

interface EnhancedSidebarProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  messages: any[];
  onSearch: (query: string) => void;
  searchResults: any[];
  currentQuery: string;
  isConnected: boolean;
  className?: string;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
    case 'announcements':
      return Bell;
    case 'morning journey':
    case 'morning-journey':
      return Calendar;
    case 'general':
      return MessageSquare;
    default:
      return Hash;
  }
};

const getChannelColor = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
    case 'announcements':
      return 'text-amber-600 dark:text-amber-400';
    case 'morning journey':
    case 'morning-journey':
      return 'text-emerald-600 dark:text-emerald-400';
    case 'general':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  messages,
  onSearch,
  searchResults,
  currentQuery,
  isConnected,
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['channels']));

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const publicChannels = channels.filter(c => c.type === 'public' || !c.type);
  const favoriteChannels = channels.filter(c => c.isPinned);

  return (
    <Card className={`w-full sm:w-80 h-full border-0 rounded-none bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 ${className}`}>
      <Tabs defaultValue="channels" className="h-full flex flex-col">
        <div className="p-3 sm:p-4 border-b bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-700">
            <TabsTrigger value="channels" className="text-xs touch-target data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Hash className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Channels</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs touch-target data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Search className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Search</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs touch-target data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Users</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs touch-target data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="channels" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Connection Status */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-xs font-medium">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Favorite Channels */}
                {favoriteChannels.length > 0 && (
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between p-2 h-auto font-medium text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 touch-target"
                      onClick={() => toggleGroup('favorites')}
                    >
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3" />
                        <span className="truncate">Favorites</span>
                      </div>
                      {expandedGroups.has('favorites') ? 
                        <ChevronDown className="h-3 w-3 flex-shrink-0" /> : 
                        <ChevronRight className="h-3 w-3 flex-shrink-0" />
                      }
                    </Button>
                    
                    {expandedGroups.has('favorites') && (
                      <div className="mt-2 space-y-1">
                        {favoriteChannels.map((channel) => {
                          const Icon = getChannelIcon(channel.name);
                          const isActive = channel.name === activeChannel;
                          const colorClass = getChannelColor(channel.name);
                          
                          return (
                            <Button
                              key={channel.id}
                              onClick={() => onChannelSelect(channel.name)}
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 min-h-[44px] px-3 text-left font-normal touch-target",
                                isActive 
                                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100" 
                                  : `hover:bg-gray-100 dark:hover:bg-gray-800 ${colorClass}`
                              )}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1 truncate text-sm">{channel.name}</span>
                              {channel.unreadCount && channel.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                                  {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                                </Badge>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Public Channels */}
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between p-2 h-auto font-medium text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400 touch-target"
                    onClick={() => toggleGroup('channels')}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Channels</span>
                      <Badge variant="secondary" className="h-4 px-1.5 text-xs">
                        {publicChannels.length}
                      </Badge>
                    </div>
                    {expandedGroups.has('channels') ? 
                      <ChevronDown className="h-3 w-3 flex-shrink-0" /> : 
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    }
                  </Button>
                  
                  {expandedGroups.has('channels') && (
                    <div className="mt-2 space-y-1">
                      {publicChannels.length === 0 ? (
                        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                          <Hash className="h-6 w-6 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No channels available</p>
                        </div>
                      ) : (
                        publicChannels.map((channel) => {
                          const Icon = getChannelIcon(channel.name);
                          const isActive = channel.name === activeChannel;
                          const colorClass = getChannelColor(channel.name);
                          
                          return (
                            <Button
                              key={channel.id}
                              onClick={() => onChannelSelect(channel.name)}
                              variant={isActive ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start gap-3 min-h-[44px] px-3 text-left font-normal touch-target",
                                isActive 
                                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-100" 
                                  : `hover:bg-gray-100 dark:hover:bg-gray-800 ${colorClass}`
                              )}
                            >
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {channel.name}
                                </div>
                                {channel.description && (
                                  <div className="text-xs opacity-70 line-clamp-2">
                                    {channel.description}
                                  </div>
                                )}
                              </div>
                              {channel.unreadCount && channel.unreadCount > 0 && (
                                <Badge variant="destructive" className="h-5 px-1.5 text-xs flex-shrink-0">
                                  {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                                </Badge>
                              )}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Add Channel Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2 min-h-[44px] text-xs border-dashed touch-target"
                >
                  <Plus className="h-3 w-3" />
                  Add Channel
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="search" className="h-full m-0 p-0">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="bg-white dark:bg-gray-800 min-h-[44px]"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs touch-target">
                    <Filter className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Filters</span>
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1">
                {searchQuery ? (
                  <div className="space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors touch-target"
                        >
                          <div className="text-sm font-medium mb-1 truncate">
                            {result.sender?.full_name || result.sender?.username || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {result.content}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(result.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No results found</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Type to search messages</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="users" className="h-full m-0 p-0">
            <div className="p-4">
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Online Users</p>
                <p className="text-xs">Feature coming soon</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0 p-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Chat Settings</h3>
                  <div className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                      <Bell className="h-3 w-3 mr-2" />
                      Notifications
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs">
                      <Archive className="h-3 w-3 mr-2" />
                      Archived Channels
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Analytics</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Messages</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {messages.length}
                      </p>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-3 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Active Channels</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        {channels.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};
