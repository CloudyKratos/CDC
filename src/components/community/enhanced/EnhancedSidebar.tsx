
import React from 'react';
import { Hash, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface EnhancedSidebarProps {
  activeChannel: string;
  onChannelSelect?: (channel: string) => void;
  isConnected: boolean;
}

const mockChannels = [
  { name: 'general', description: 'General discussion', memberCount: 42 },
  { name: 'random', description: 'Random chat', memberCount: 28 },
  { name: 'tech-talk', description: 'Technology discussions', memberCount: 15 },
  { name: 'announcements', description: 'Important updates', memberCount: 56 },
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  isConnected
}) => {
  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Channels */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Channels
          </div>
          {mockChannels.map((channel) => (
            <Button
              key={channel.name}
              variant={activeChannel === channel.name ? "secondary" : "ghost"}
              className="w-full justify-start h-auto p-2"
              onClick={() => onChannelSelect?.(channel.name)}
            >
              <div className="flex items-center gap-2 w-full">
                <Hash className="h-4 w-4" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{channel.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {channel.description}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {channel.memberCount}
                </Badge>
              </div>
            </Button>
          ))}
        </div>

        <Separator className="my-4" />

        {/* Settings */}
        <div className="space-y-1">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Settings
          </div>
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
};
