
import React from 'react';
import { Wifi, WifiOff, Users, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ChatStatusBarProps {
  isConnected: boolean;
  onlineUsers: number;
  messageCount: number;
  channelName: string;
}

export const ChatStatusBar: React.FC<ChatStatusBarProps> = ({
  isConnected,
  onlineUsers,
  messageCount,
  channelName
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2 bg-muted/30 border-b border-border text-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-600" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-600" />
          )}
          <Badge 
            variant={isConnected ? "default" : "destructive"} 
            className="text-xs"
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{onlineUsers} online</span>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>{messageCount} messages</span>
        </div>
      </div>
      
      <div className="text-muted-foreground">
        #{channelName}
      </div>
    </div>
  );
};
