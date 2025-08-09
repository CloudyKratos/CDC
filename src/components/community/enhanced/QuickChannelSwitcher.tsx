
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
  CommandList,
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
  channels = [],
  activeChannel,
  onChannelSelect,
  onCreateChannel,
  className = ''
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Ensure channels is always an array with proper structure
  const safeChannels = React.useMemo(() => {
    if (!Array.isArray(channels)) return [];
    return channels.filter(channel => 
      channel && 
      typeof channel === 'object' && 
      typeof channel.name === 'string'
    );
  }, [channels]);
  
  const currentChannel = safeChannels.find(c => c.name === activeChannel);
  
  const filteredChannels = React.useMemo(() => {
    if (!searchValue.trim()) return safeChannels;
    return safeChannels.filter(channel =>
      channel.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [safeChannels, searchValue]);

  const handleSelect = (channelName: string) => {
    if (channelName && onChannelSelect) {
      onChannelSelect(channelName);
      setOpen(false);
      setSearchValue('');
    }
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
            "justify-between font-medium text-left max-w-xs touch-target-optimal min-h-[44px]",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <span className="truncate text-sm">{activeChannel || 'Select Channel'}</span>
            {currentChannel?.isPinned && (
              <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 z-50" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search channels..." 
            value={searchValue}
            onValueChange={setSearchValue}
            className="min-h-[44px]"
          />
          
          <CommandList>
            {filteredChannels.length === 0 && searchValue ? (
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
                      className="gap-2 touch-target-optimal"
                    >
                      <Plus className="h-3 w-3" />
                      Create "{searchValue}"
                    </Button>
                  )}
                </div>
              </CommandEmpty>
            ) : (
              <CommandGroup heading="Channels">
                {filteredChannels.map((channel) => (
                  <CommandItem
                    key={channel.id || channel.name}
                    value={channel.name}
                    onSelect={() => handleSelect(channel.name)}
                    className="flex items-center justify-between min-h-[44px] px-3 touch-target"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="truncate text-sm">{channel.name}</span>
                      {channel.isPinned && (
                        <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                      )}
                    </div>
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="h-4 px-1.5 text-xs ml-2 flex-shrink-0">
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </Badge>
                    )}
                  </CommandItem>
                ))}
                
                {filteredChannels.length === 0 && !searchValue && (
                  <div className="p-4 text-center text-sm text-gray-500">
                    No channels available
                  </div>
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
