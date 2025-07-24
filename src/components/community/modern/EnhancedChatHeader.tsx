
import React from 'react';
import { Hash, Users, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EnhancedChatHeaderProps {
  channelName: string;
  messageCount: number;
  onlineUsers: number;
  isConnected: boolean;
  isLoading: boolean;
  onReconnect?: () => void;
}

export const EnhancedChatHeader: React.FC<EnhancedChatHeaderProps> = ({
  channelName,
  messageCount,
  onlineUsers,
  isConnected,
  isLoading,
  onReconnect
}) => {
  return (
    <div className="p-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">{channelName}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {messageCount} messages
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineUsers} online
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-500 hidden sm:inline text-sm">Connected</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-500 hidden sm:inline text-sm">Disconnected</span>
                {onReconnect && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onReconnect}
                    className="h-8 px-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
