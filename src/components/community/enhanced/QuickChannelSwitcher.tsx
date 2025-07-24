
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface QuickChannelSwitcherProps {
  activeChannel: string;
  onChannelSelect?: (channel: string) => void;
}

const quickChannels = ['general', 'random', 'tech-talk', 'announcements'];

export const QuickChannelSwitcher: React.FC<QuickChannelSwitcherProps> = ({
  activeChannel,
  onChannelSelect
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 px-3 gap-2">
          <Hash className="h-4 w-4" />
          <span className="font-medium">{activeChannel}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {quickChannels.map((channel) => (
          <DropdownMenuItem
            key={channel}
            onClick={() => onChannelSelect?.(channel)}
            className="flex items-center gap-2"
          >
            <Hash className="h-4 w-4" />
            <span>{channel}</span>
            {channel === activeChannel && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
