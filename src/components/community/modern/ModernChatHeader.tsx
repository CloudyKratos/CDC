
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Users, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Settings,
  Search,
  Phone,
  Video
} from 'lucide-react';

interface ModernChatHeaderProps {
  channelName: string;
  messageCount: number;
  onlineUsers: number;
  isConnected: boolean;
  isLoading: boolean;
  onReconnect: () => void;
  onOpenSettings?: () => void;
  onStartCall?: () => void;
  onStartVideo?: () => void;
}

export const ModernChatHeader: React.FC<ModernChatHeaderProps> = ({
  channelName,
  messageCount,
  onlineUsers,
  isConnected,
  isLoading,
  onReconnect,
  onOpenSettings,
  onStartCall,
  onStartVideo
}) => {
  const getConnectionStatus = () => {
    if (isConnected) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium">Live</span>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent" />
          <span className="text-sm font-medium">Connecting...</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
        <WifiOff className="h-4 w-4" />
        <span className="text-sm font-medium">Offline</span>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Hash className="h-6 w-6 text-blue-600 dark:text-accent" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 dark:bg-accent rounded-full animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold theme-text-primary">
              {channelName}
            </h2>
            <div className="flex items-center gap-4 text-sm theme-text-muted">
              <span>{messageCount} messages</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{onlineUsers} online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {getConnectionStatus()}
        
        <div className="flex items-center gap-1 ml-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-accent"
          >
            <Search className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartCall}
            className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartVideo}
            className="h-9 w-9 p-0 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400"
          >
            <Video className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            disabled={isLoading}
            className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
