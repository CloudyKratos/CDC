
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
    <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-background via-background/95 to-background backdrop-blur-sm">
      {/* Left side - Channel info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            {isConnected && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              {channelName}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-muted-foreground/60" />
                {messageCount} {messageCount === 1 ? 'message' : 'messages'}
              </span>
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                <span>{onlineUsers} online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Actions and status */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center">
          {isConnected ? (
            <Badge 
              variant="outline" 
              className="text-green-600 border-green-200/50 bg-green-50/80 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400 px-3 py-1.5 rounded-lg font-medium backdrop-blur-sm"
            >
              <Wifi className="h-3.5 w-3.5 mr-2" />
              Live
            </Badge>
          ) : (
            <Badge 
              variant="outline" 
              className="text-red-600 border-red-200/50 bg-red-50/80 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 px-3 py-1.5 rounded-lg font-medium"
            >
              <WifiOff className="h-3.5 w-3.5 mr-2" />
              {isLoading ? 'Connecting...' : 'Offline'}
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
              className="h-9 px-3 rounded-lg hover:bg-muted/80 transition-all duration-200"
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
              className="h-9 w-9 p-0 rounded-lg hover:bg-muted/80 transition-all duration-200"
              title="Start voice call"
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
              className="h-9 w-9 p-0 rounded-lg hover:bg-muted/80 transition-all duration-200"
              title="Start video call"
            >
              <Video className="h-4 w-4" />
            </Button>
          )}

          {onSettings && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSettings}
              className="h-9 w-9 p-0 rounded-lg hover:bg-muted/80 transition-all duration-200"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
