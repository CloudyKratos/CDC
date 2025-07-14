
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Users, 
  Settings, 
  ChevronDown,
  Plus,
  Lock,
  Volume2,
  X,
  Menu,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatChannel } from '@/types/chat';

interface ChannelSidebarProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  isLoading?: boolean;
  isMobile?: boolean;
  showChannelList: boolean;
  setShowChannelList: (show: boolean) => void;
  onClose?: () => void;
  onToggleChannelList?: (show: boolean) => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isLoading = false,
  isMobile = false,
  showChannelList,
  setShowChannelList,
  onClose,
  onToggleChannelList
}) => {
  if (!showChannelList) return null;

  const getChannelIcon = (channel: ChatChannel) => {
    if (channel.type === 'PRIVATE') return <Lock className="h-4 w-4" />;
    if (channel.type === 'VOICE') return <Volume2 className="h-4 w-4" />;
    return <Hash className="h-4 w-4" />;
  };

  const getChannelBadge = (channel: ChatChannel) => {
    if (channel.name === 'general') return <Badge variant="secondary" className="text-xs">Popular</Badge>;
    if (channel.name === 'announcements') return <Badge variant="default" className="text-xs bg-blue-500">Official</Badge>;
    return null;
  };

  const handleClose = () => {
    setShowChannelList(false);
    onClose?.();
    onToggleChannelList?.(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-b from-slate-50 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900/50 border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl backdrop-blur-sm",
        isMobile ? "fixed left-0 top-0 h-full z-50 w-80" : "relative w-64",
        "flex flex-col"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white">Community</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {channels.length} channels
                </p>
              </div>
            </div>
            
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Channels List */}
        <ScrollArea className="flex-1 px-3 py-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Text Channels
              </span>
              <Button variant="ghost" size="sm" className="h-5 w-5 p-0 opacity-60 hover:opacity-100">
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              channels.map((channel) => {
                const isActive = activeChannel === channel.id;
                return (
                  <button
                    key={channel.id}
                    onClick={() => {
                      onChannelSelect(channel.id);
                      if (isMobile) handleClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-105"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:scale-102"
                    )}
                  >
                    <div className={cn(
                      "flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                    )}>
                      {getChannelIcon(channel)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium truncate",
                          isActive ? "text-white" : "text-gray-900 dark:text-gray-100"
                        )}>
                          {channel.name}
                        </span>
                        {getChannelBadge(channel)}
                      </div>
                      {channel.description && (
                        <p className={cn(
                          "text-xs truncate mt-0.5",
                          isActive ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                        )}>
                          {channel.description}
                        </p>
                      )}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 bg-white rounded-full shadow-lg animate-pulse" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Sparkles className="h-3 w-3" />
            <span>Real-time messaging</span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <Settings className="h-4 w-4" />
            <span>Channel Settings</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default ChannelSidebar;
