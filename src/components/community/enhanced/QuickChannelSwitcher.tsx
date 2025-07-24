
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Hash, ChevronDown, Plus, Star } from 'lucide-react';
import { ChatChannel } from '@/types/chat';
import { cn } from '@/lib/utils';

interface QuickChannelSwitcherProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  onCreateChannel?: (channelName: string) => void;
  className?: string;
}

export const QuickChannelSwitcher: React.FC<QuickChannelSwitcherProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  onCreateChannel,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const currentChannel = channels.find(c => c.name === activeChannel);
  
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const handleSelect = (channelName: string) => {
    onChannelSelect(channelName);
    setOpen(false);
    setSearchValue('');
  };

  const handleCreateChannel = () => {
    if (searchValue.trim() && onCreateChannel) {
      onCreateChannel(searchValue.trim());
      setOpen(false);
      setSearchValue('');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between font-medium text-left max-w-xs",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="truncate">{activeChannel}</span>
            {currentChannel?.isPinned && (
              <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Search channels..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>
            <div className="p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                No channels found
              </p>
              {searchValue.trim() && onCreateChannel && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateChannel}
                  className="gap-2"
                >
                  <Plus className="h-3 w-3" />
                  Create "{searchValue}"
                </Button>
              )}
            </div>
          </CommandEmpty>
          
          <CommandGroup heading="Channels">
            {filteredChannels.map((channel) => (
              <CommandItem
                key={channel.id}
                value={channel.name}
                onSelect={() => handleSelect(channel.name)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span>{channel.name}</span>
                  {channel.isPinned && (
                    <Star className="h-3 w-3 text-yellow-500" />
                  )}
                </div>
                {channel.unreadCount && channel.unreadCount > 0 && (
                  <Badge variant="destructive" className="h-4 px-1.5 text-xs ml-2">
                    {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                  </Badge>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
