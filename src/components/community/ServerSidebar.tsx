
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Volume2, 
  BookOpen, 
  Trophy, 
  Globe, 
  MessageSquare,
  Mic,
  Settings,
  UserPlus,
  ChevronDown
} from 'lucide-react';

interface ServerSidebarProps {
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  collapsed?: boolean;
}

const ServerSidebar: React.FC<ServerSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  collapsed = false
}) => {
  const textChannels = [
    { id: 'general', name: 'general', icon: Hash },
    { id: 'introduction', name: 'introduction', icon: BookOpen },
    { id: 'hall-of-fame', name: 'hall-of-fame', icon: Trophy },
    { id: 'daily-talks', name: 'daily-talks', icon: MessageSquare },
    { id: 'global-connect', name: 'global-connect', icon: Globe, special: true }
  ];

  const voiceChannels = [
    { id: 'stage-rooms', name: 'Stage Rooms', icon: Mic, type: 'stage' }
  ];

  if (collapsed) return null;

  return (
    <div className="w-60 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Server Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Community Hub
          </h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <UserPlus size={14} />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Text Channels */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-1">
                <ChevronDown size={12} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Text Channels
                </span>
              </div>
            </div>
            
            {textChannels.map((channel) => {
              const Icon = channel.icon;
              const isActive = activeChannel === channel.id;
              
              return (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start gap-2 h-8 px-2 ${
                    isActive 
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <Icon size={16} />
                  <span className="text-sm">{channel.name}</span>
                  {channel.special && (
                    <Badge variant="outline" className="ml-auto text-[10px] h-4">
                      Global
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          {/* Voice Channels / Stage Rooms */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 py-1">
              <div className="flex items-center gap-1">
                <ChevronDown size={12} className="text-gray-500" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Voice Channels
                </span>
              </div>
            </div>
            
            {voiceChannels.map((channel) => {
              const Icon = channel.icon;
              const isActive = activeChannel === channel.id;
              
              return (
                <Button
                  key={channel.id}
                  variant="ghost"
                  className={`w-full justify-start gap-2 h-8 px-2 ${
                    isActive 
                      ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-150 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <Icon size={16} />
                  <span className="text-sm">{channel.name}</span>
                  {channel.type === 'stage' && (
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      LIVE
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ServerSidebar;
