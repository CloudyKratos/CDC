
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Hash, 
  Volume2, 
  Settings, 
  UserPlus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const [voiceChannelsExpanded, setVoiceChannelsExpanded] = React.useState(true);

  if (collapsed) {
    return null;
  }

  return (
    <div className="w-60 bg-gray-100 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Server Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">Warrior Community</h2>
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
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
              TEXT CHANNELS
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
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white"
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

          {/* Voice Channels Section */}
          <div className="mb-4">
            <Button
              variant="ghost"
              className="w-full justify-start p-1 h-6 mb-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setVoiceChannelsExpanded(!voiceChannelsExpanded)}
            >
              {voiceChannelsExpanded ? (
                <ChevronDown className="h-3 w-3 mr-1" />
              ) : (
                <ChevronRight className="h-3 w-3 mr-1" />
              )}
              VOICE CHANNELS
            </Button>

            {voiceChannelsExpanded && (
              <div className="space-y-1">
                <Button
                  variant={activeChannel === 'stage-rooms' ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-2 h-8 text-sm ${
                    activeChannel === 'stage-rooms'
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => onChannelSelect('stage-rooms')}
                >
                  <Volume2 className="h-4 w-4" />
                  <span className="truncate">Stage Rooms</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User Section */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <UserPlus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerSidebar;
