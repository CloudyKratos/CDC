
import React, { useState } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  Volume2, 
  Users, 
  Settings, 
  PlusCircle,
  ChevronDown,
  Headphones,
  Mic,
  MessageSquare,
  Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ServerSidebarProps {
  activeChannel: string;
  onChannelSelect: (channel: string) => void;
  collapsed?: boolean;
}

const ServerSidebar: React.FC<ServerSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  collapsed = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState({
    community: true,
    voice: true,
    events: false
  });
  
  const { user } = useAuth();
  
  const toggleCategory = (category: keyof typeof expandedCategories) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  
  // Channel lists by category
  const textChannels = [
    { id: 'general', name: 'general', icon: <Hash size={18} />, category: 'community', unread: 3 },
    { id: 'introduction', name: 'introduction', icon: <Hash size={18} />, category: 'community' },
    { id: 'hall-of-fame', name: 'hall-of-fame', icon: <Hash size={18} />, category: 'community' },
    { id: 'daily-talks', name: 'daily-talks', icon: <Hash size={18} />, category: 'community', unread: 1 },
    { id: 'global-connect', name: 'global-connect', icon: <Hash size={18} />, category: 'community' }
  ];
  
  const voiceChannels = [
    { id: 'voice-general', name: 'General Voice', icon: <Volume2 size={18} />, category: 'voice', participants: 2 },
    { id: 'voice-coworking', name: 'Co-working', icon: <Volume2 size={18} />, category: 'voice' }
  ];
  
  const eventChannels = [
    { id: 'upcoming-events', name: 'Upcoming Events', icon: <Bell size={18} />, category: 'events' },
    { id: 'event-planning', name: 'Event Planning', icon: <Hash size={18} />, category: 'events' }
  ];
  
  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-900/95 text-white transition-all duration-300",
      collapsed ? "w-0 overflow-hidden" : "w-60"
    )}>
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="font-bold text-lg">Community Hub</h2>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
          <Settings size={18} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {/* Text Channels */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between px-1 py-1 text-xs font-semibold text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={() => toggleCategory('community')}
            >
              <div className="flex items-center">
                <ChevronDown size={14} className={`mr-1 transition-transform ${expandedCategories.community ? '' : '-rotate-90'}`} />
                COMMUNITY
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white">
                <PlusCircle size={14} />
              </Button>
            </div>
            
            {expandedCategories.community && (
              <div className="mt-1 space-y-0.5">
                {textChannels.map(channel => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 py-0.5 h-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-sm relative",
                      activeChannel === channel.id && "bg-gray-700/80 text-white"
                    )}
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <span className="flex items-center text-left">
                      {channel.icon}
                      <span className="ml-1 text-sm">{channel.name}</span>
                    </span>
                    
                    {channel.unread && (
                      <span className="absolute right-2 top-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white rounded-full text-xs font-semibold">
                        {channel.unread}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          {/* Voice Channels */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between px-1 py-1 text-xs font-semibold text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={() => toggleCategory('voice')}
            >
              <div className="flex items-center">
                <ChevronDown size={14} className={`mr-1 transition-transform ${expandedCategories.voice ? '' : '-rotate-90'}`} />
                VOICE CHANNELS
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white">
                <PlusCircle size={14} />
              </Button>
            </div>
            
            {expandedCategories.voice && (
              <div className="mt-1 space-y-0.5">
                {voiceChannels.map(channel => (
                  <div key={channel.id} className="relative">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start px-2 py-0.5 h-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-sm relative",
                        activeChannel === channel.id && "bg-gray-700/80 text-white"
                      )}
                      onClick={() => onChannelSelect(channel.id)}
                    >
                      <span className="flex items-center text-left">
                        {channel.icon}
                        <span className="ml-1 text-sm">{channel.name}</span>
                      </span>
                    </Button>
                    
                    {channel.participants && (
                      <div className="absolute top-1 right-2 flex items-center space-x-1">
                        <span className="text-xs text-gray-400">{channel.participants}</span>
                        <Users size={12} className="text-gray-400" />
                      </div>
                    )}
                    
                    {channel.participants && (
                      <div className="mt-0.5 pl-8 text-xs text-gray-500">
                        {Array(channel.participants).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center space-x-1 py-0.5">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>{i === 0 ? 'Alex Johnson' : 'Sarah Miller'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Events */}
          <div className="mb-4">
            <div 
              className="flex items-center justify-between px-1 py-1 text-xs font-semibold text-gray-400 hover:text-gray-200 cursor-pointer"
              onClick={() => toggleCategory('events')}
            >
              <div className="flex items-center">
                <ChevronDown size={14} className={`mr-1 transition-transform ${expandedCategories.events ? '' : '-rotate-90'}`} />
                EVENTS
              </div>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white">
                <PlusCircle size={14} />
              </Button>
            </div>
            
            {expandedCategories.events && (
              <div className="mt-1 space-y-0.5">
                {eventChannels.map(channel => (
                  <Button
                    key={channel.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start px-2 py-0.5 h-8 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-sm",
                      activeChannel === channel.id && "bg-gray-700/80 text-white"
                    )}
                    onClick={() => onChannelSelect(channel.id)}
                  >
                    <span className="flex items-center text-left">
                      {channel.icon}
                      <span className="ml-1 text-sm">{channel.name}</span>
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-2 mt-auto bg-gray-900/95 border-t border-gray-800">
        <div className="flex items-center justify-between bg-gray-800/50 p-2 rounded">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'user'}`} />
              <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium line-clamp-1">{user?.email?.split('@')[0] || 'User'}</p>
              <p className="text-xs text-gray-400 flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full inline-block mr-1"></span>
                Online
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white">
                    <Mic size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Mute</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white">
                    <Headphones size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Deafen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white">
                    <Settings size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerSidebar;
