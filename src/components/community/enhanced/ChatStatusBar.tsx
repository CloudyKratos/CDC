
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Users, MessageSquare, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatStatusBarProps {
  isConnected: boolean;
  isLoading: boolean;
  messageCount: number;
  activeUsers?: number;
  lastActivity?: string;
  onReconnect?: () => void;
  className?: string;
}

export const ChatStatusBar: React.FC<ChatStatusBarProps> = ({
  isConnected,
  isLoading,
  messageCount,
  activeUsers = 1,
  lastActivity,
  onReconnect,
  className = ''
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm border-b",
      className
    )}>
      <div className="flex items-center gap-3">
        {/* Connection Status */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
          )}
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="text-xs px-2 h-5"
          >
            {isLoading ? 'Connecting...' : isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <MessageSquare className="h-3 w-3" />
            <span>{messageCount} messages</span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Users className="h-3 w-3" />
            <span>{activeUsers} online</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {lastActivity && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Last: {lastActivity}
          </span>
        )}
        
        {!isConnected && onReconnect && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="h-6 px-2 text-xs"
            disabled={isLoading}
          >
            <RefreshCw className={cn(
              "h-3 w-3 mr-1",
              isLoading && "animate-spin"
            )} />
            Reconnect
          </Button>
        )}
      </div>
    </div>
  );
};
