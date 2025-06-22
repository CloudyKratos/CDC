
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Hash, 
  Lock, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Users,
  Bell,
  Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Channel {
  id: string;
  name: string;
  type: string;
  is_private: boolean;
  description?: string;
  unread_count?: number;
}

interface ChannelSidebarProps {
  selectedChannel: string;
  onChannelSelect: (channel: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  selectedChannel,
  onChannelSelect,
  collapsed,
  onToggleCollapse
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  // Load channels
  useEffect(() => {
    if (!user) return;

    const loadChannels = async () => {
      try {
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .order('name');

        if (error) throw error;
        setChannels(data || []);
      } catch (error) {
        console.error('Failed to load channels:', error);
      }
    };

    loadChannels();

    // Subscribe to channel changes
    const channelSubscription = supabase
      .channel('channels_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'channels'
        },
        () => {
          loadChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
  }, [user]);

  const createChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('channels')
        .insert({
          name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
          type: 'public',
          created_by: user.id,
          description: `${newChannelName} channel`
        });

      if (error) throw error;

      setNewChannelName('');
      setIsCreateChannelOpen(false);
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={cn(
      "bg-muted/30 border-r transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="font-semibold text-lg">Channels</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {!collapsed && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
          </div>
        )}
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {!collapsed && (
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <span>Text Channels</span>
              <Dialog open={isCreateChannelOpen} onOpenChange={setIsCreateChannelOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <Plus className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Channel name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && createChannel()}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateChannelOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createChannel} disabled={isCreating}>
                        {isCreating ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {filteredChannels.map((channel) => (
            <Button
              key={channel.id}
              variant={selectedChannel === channel.name ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-normal",
                collapsed ? "px-2" : "px-2",
                selectedChannel === channel.name && "bg-accent"
              )}
              onClick={() => onChannelSelect(channel.name)}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                {channel.is_private ? (
                  <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <Hash className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                )}
                {!collapsed && (
                  <>
                    <span className="truncate">{channel.name}</span>
                    {channel.unread_count && channel.unread_count > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs px-1.5 py-0.5">
                        {channel.unread_count}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* User Area */}
      <div className="p-4 border-t">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium truncate">
                {user?.email?.split('@')[0] || 'User'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Users className="h-4 w-4 mr-2" />
                  User Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSidebar;
