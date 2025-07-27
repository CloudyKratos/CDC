
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Hash, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  channels: Array<{
    id: string;
    name: string;
    type: string;
    description?: string;
    unreadCount?: number;
    isPinned?: boolean;
  }>;
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  className?: string;
}

export const CollapsibleChatSidebar: React.FC<CollapsibleChatSidebarProps> = ({
  isCollapsed,
  onToggle,
  channels,
  activeChannel,
  onChannelSelect,
  className
}) => {
  return (
    <div className={cn(
      "bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        {!isCollapsed && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Channels
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {channels.length} channels
            </p>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-800"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Channels List */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {channels.map((channel) => (
            <Button
              key={channel.id}
              variant={activeChannel === channel.id ? "secondary" : "ghost"}
              onClick={() => onChannelSelect(channel.id)}
              className={cn(
                "w-full justify-start h-auto p-2 transition-all duration-200",
                isCollapsed ? "px-2" : "px-3",
                activeChannel === channel.id 
                  ? "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800" 
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              )}
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Hash className="h-4 w-4 flex-shrink-0" />
                
                {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start min-w-0 flex-1">
                      <span className="text-sm font-medium truncate">
                        {channel.name}
                      </span>
                      {channel.description && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {channel.description}
                        </span>
                      )}
                    </div>
                    
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5 bg-blue-600 text-white">
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Users className="h-3 w-3" />
            <span>Community Chat</span>
            <Settings className="h-3 w-3 ml-auto cursor-pointer hover:text-slate-900 dark:hover:text-slate-100" />
          </div>
        </div>
      )}
    </div>
  );
};
