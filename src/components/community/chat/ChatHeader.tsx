
import React from 'react';
import { Hash, Wifi, WifiOff, Users, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  activeChannel: string;
  channels: Array<{ id: string; name: string; emoji: string }>;
  onChannelChange: (channel: string) => void;
  isConnected: boolean;
  messageCount: number;
  error?: string | null;
  onReconnect: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChannel,
  channels,
  onChannelChange,
  isConnected,
  messageCount,
  error,
  onReconnect
}) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hash className="h-5 w-5 text-blue-500" />
          <select
            value={activeChannel}
            onChange={(e) => onChannelChange(e.target.value)}
            className="bg-transparent text-lg font-semibold text-gray-900 dark:text-white border-none outline-none cursor-pointer"
          >
            {channels.map(channel => (
              <option key={channel.id} value={channel.name}>
                {channel.emoji} {channel.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <Wifi className="h-3 w-3 mr-1" />
              Live
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </Badge>
          )}
          
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            <Users className="h-3 w-3 mr-1" />
            {messageCount}
          </Badge>

          {error && (
            <Button
              onClick={onReconnect}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
