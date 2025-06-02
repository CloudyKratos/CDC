
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Hash, 
  Volume2, 
  ChevronDown,
  ChevronRight,
  Menu
} from "lucide-react";
import { ChatChannel } from '@/types/chat';

interface ServerSidebarProps {
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  collapsed?: boolean;
  channels?: ChatChannel[];
}

const ServerSidebar: React.FC<ServerSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  collapsed = false,
  channels = []
}) => {
  const [textChannelsExpanded, setTextChannelsExpanded] = React.useState(true);

  if (collapsed) {
    return null;
  }

  return (
    <div className="w-60 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Minimal Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold text-gray-900 dark:text-white">Community Chat</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Text Channels Section */}
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-start p-1 h-6 mb-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setTextChannelsExpanded(!textChannelsExpanded)}
            >
              {textChannelsExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              CHANNELS
            </Button>

            {textChannelsExpanded && (
              <div className="space-y-1">
                {channels.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400 p-2">
                    Loading channels...
                  </div>
                ) : (
                  channels.map((channel) => (
                    <Button
                      key={channel.id}
                      variant={activeChannel === channel.name ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-2 h-8 text-sm ${
                        activeChannel === channel.name
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => onChannelSelect(channel.name)}
                    >
                      <Hash className="h-4 w-4" />
                      <span className="truncate">{channel.name}</span>
                    </Button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
