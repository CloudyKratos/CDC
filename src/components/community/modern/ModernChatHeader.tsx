
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Users, 
  Settings, 
  Search,
  Bell,
  Calendar,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernChatHeaderProps {
  channelName: string;
  messageCount: number;
  onlineUsers: number;
  isConnected: boolean;
  isLoading?: boolean;
  onReconnect?: () => void;
  className?: string;
}

const getChannelIcon = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
      return Bell;
    case 'morning-journey':
    case 'morning journey':
      return Calendar;
    default:
      return Hash;
  }
};

const getChannelColor = (channelName: string) => {
  switch (channelName.toLowerCase()) {
    case 'announcement':
      return 'from-yellow-500 to-orange-500';
    case 'morning-journey':
    case 'morning journey':
      return 'from-green-500 to-emerald-500';
    default:
      return 'from-blue-500 to-purple-500';
  }
};

export const ModernChatHeader: React.FC<ModernChatHeaderProps> = ({
  channelName,
  messageCount,
  onlineUsers,
  isConnected,
  isLoading = false,
  onReconnect,
  className = ""
}) => {
  const IconComponent = getChannelIcon(channelName);
  const gradientClass = getChannelColor(channelName);

  return (
    <div className={cn(
      "px-6 py-4 border-b border-gray-200/60 dark:border-gray-700/60 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Left Section - Channel Info */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br",
              gradientClass
            )}>
              <IconComponent className="h-5 w-5 text-white" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {channelName}
                </h1>
                <Badge 
                  variant="outline" 
                  className="text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                >
                  {messageCount} messages
                </Badge>
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="h-3.5 w-3.5" />
                  <span>{onlineUsers} online</span>
                </div>
                
                <div className="flex items-center gap-1.5 text-xs">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )} />
                  <span className={cn(
                    "font-medium",
                    isConnected 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            disabled={isLoading}
            className="h-8 px-3 text-xs"
          >
            {isLoading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1.5" />
            ) : (
              <div className="mr-1.5">
                {isConnected ? (
                  <Wifi className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            )}
            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Reconnect'}
          </Button>

          <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Bell className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
