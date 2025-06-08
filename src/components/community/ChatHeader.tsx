
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  activeChannel: string;
  isOnline: boolean;
  reconnecting: boolean;
  isMobile: boolean;
  showChannelList: boolean;
  setShowChannelList: (show: boolean) => void;
  showMembersList: boolean;
  setShowMembersList: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChannel,
  isOnline,
  reconnecting,
  isMobile,
  showChannelList,
  setShowChannelList,
  showMembersList,
  setShowMembersList
}) => {
  const getChannelDisplayName = (channelName: string) => {
    return channelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChannelList(!showChannelList)}
            className="md:hidden"
          >
            <Hash size={16} />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Hash size={20} className="text-gray-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
            {getChannelDisplayName(activeChannel)}
          </h2>
          {!isOnline && (
            <Badge variant="destructive" className="text-xs">
              Offline
            </Badge>
          )}
          {reconnecting && (
            <Badge variant="secondary" className="text-xs">
              Reconnecting...
            </Badge>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          {isOnline && !reconnecting ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMembersList(!showMembersList)}
          className="hidden lg:flex"
        >
          <Users size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
