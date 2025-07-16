
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatChannel } from '@/types/chat';
import { Hash, Users, Bell, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelNavigatorProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
      return Bell;
    case 'morning journey':
      return Calendar;
    default:
      return Hash;
  }
};

const getChannelColor = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'morning journey':
      return 'text-green-600 dark:text-green-400';
    default:
      return 'text-blue-600 dark:text-blue-400';
  }
};

export const ChannelNavigator: React.FC<ChannelNavigatorProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isCollapsed = false,
  onToggleCollapse,
  className = ''
}) => {
  console.log('🎛️ ChannelNavigator rendered with:', { 
    channelsCount: channels.length, 
    activeChannel, 
    isCollapsed,
    channels: channels.map(c => c.name)
  });

  if (isCollapsed) {
    return (
      <Card className={`w-16 h-full border-r border-border bg-background ${className}`}>
        <div className="p-2 border-b border-border">
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="w-full h-10 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {channels.map((channel) => {
              const Icon = getChannelIcon(channel.name);
              const isActive = channel.name === activeChannel;
              const colorClass = getChannelColor(channel.name);
              
              return (
                <Button
                  key={channel.id}
                  onClick={() => onChannelSelect(channel.name)}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "w-full h-10 p-0 justify-center",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : `hover:bg-muted ${colorClass}`
                  )}
                  title={channel.name}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </Card>
    );
  }

  return (
    <Card className={`w-64 h-full border-r border-border bg-background ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Channels</h2>
          <Badge variant="secondary" className="text-xs">
            {channels.length}
          </Badge>
        </div>
        {onToggleCollapse && (
          <Button
            onClick={onToggleCollapse}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {channels.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No channels available</p>
            </div>
          ) : (
            channels.map((channel) => {
              const Icon = getChannelIcon(channel.name);
              const isActive = channel.name === activeChannel;
              const colorClass = getChannelColor(channel.name);
              
              return (
                <Button
                  key={channel.id}
                  onClick={() => {
                    console.log('🎯 Channel clicked:', channel.name);
                    onChannelSelect(channel.name);
                  }}
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 text-left",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : `hover:bg-muted/70 ${colorClass}`
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {channel.name}
                    </div>
                    {channel.description && (
                      <div className="text-xs opacity-70 truncate">
                        {channel.description}
                      </div>
                    )}
                  </div>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                      {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                    </Badge>
                  )}
                </Button>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          {channels.length} channels available
        </div>
      </div>
    </Card>
  );
};

export default ChannelNavigator;
