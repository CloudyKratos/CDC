
import React from 'react';
import { Hash, Users, Wifi, WifiOff, Settings, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EnhancedChatHeaderProps {
  channelName: string;
  messageCount: number;
  onlineUsers: number;
  isConnected: boolean;
  isLoading?: boolean;
  onReconnect?: () => void;
}

export const EnhancedChatHeader: React.FC<EnhancedChatHeaderProps> = ({
  channelName,
  messageCount,
  onlineUsers,
  isConnected,
  isLoading = false,
  onReconnect
}) => {
  const getChannelIcon = () => {
    switch (channelName) {
      case 'morning journey':
        return '🌅';
      case 'announcement':
        return '📢';
      case 'general':
      default:
        return '#';
    }
  };

  const getChannelColor = () => {
    switch (channelName) {
      case 'morning journey':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-200 dark:border-orange-800';
      case 'announcement':
        return 'from-blue-500/20 to-indigo-500/20 border-blue-200 dark:border-blue-800';
      case 'general':
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <div className={`px-6 py-4 border-b bg-gradient-to-r ${getChannelColor()} backdrop-blur-sm`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="text-xl">
              {typeof getChannelIcon() === 'string' && getChannelIcon() !== '#' ? (
                <span>{getChannelIcon()}</span>
              ) : (
                <Hash className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                {channelName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {onlineUsers} online
                </span>
                <span>
                  {messageCount} messages
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                <Wifi className="h-4 w-4" />
                <span className="hidden sm:inline">Live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}
          </div>

          {/* Channel Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Channel Settings
              </DropdownMenuItem>
              {!isConnected && onReconnect && (
                <DropdownMenuItem onClick={onReconnect} className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Reconnect
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
