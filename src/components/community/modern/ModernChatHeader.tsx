
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Hash, 
  Users, 
  Phone, 
  Video, 
  Settings, 
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

interface ModernChatHeaderProps {
  channelName: string;
  messageCount: number;
  onlineUsers: number;
  isConnected: boolean;
  isLoading: boolean;
  onReconnect: () => void;
  onStartCall?: () => void;
  onStartVideo?: () => void;
  onSettings?: () => void;
}

export const ModernChatHeader: React.FC<ModernChatHeaderProps> = ({
  channelName,
  messageCount,
  onlineUsers,
  isConnected,
  isLoading,
  onReconnect,
  onStartCall,
  onStartVideo,
  onSettings
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-900 theme-border">
      {/* Left side - Channel info */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Hash className="h-5 w-5 text-blue-600 dark:text-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold theme-text-primary">
              {channelName}
            </h2>
            <div className="flex items-center gap-3 text-sm theme-text-secondary">
              <span>{messageCount} messages</span>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{onlineUsers} online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Actions and status */}
      <div className="flex items-center gap-2">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
              <Wifi className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <WifiOff className="h-3 w-3 mr-1" />
              {isLoading ? 'Connecting...' : 'Disconnected'}
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {!isConnected && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReconnect}
              disabled={isLoading}
              className="h-9 px-3"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Reconnect
            </Button>
          )}

          {onStartCall && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartCall}
              disabled={!isConnected}
              className="h-9 w-9 p-0"
            >
              <Phone className="h-4 w-4" />
            </Button>
          )}

          {onStartVideo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStartVideo}
              disabled={!isConnected}
              className="h-9 w-9 p-0"
            >
              <Video className="h-4 w-4" />
            </Button>
          )}

          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="h-9 w-9 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
