
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Menu, MessageCircle, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  activeChannel: string;
  isConnected?: boolean;
  isOnline?: boolean;
  reconnecting?: boolean;
  isMobile: boolean;
  showChannelList: boolean;
  onToggleChannelList?: (show: boolean) => void;
  setShowChannelList?: (show: boolean) => void;
  showMembersList?: boolean;
  setShowMembersList?: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChannel,
  isConnected = true,
  isOnline = true,
  reconnecting = false,
  isMobile,
  showChannelList,
  onToggleChannelList,
  setShowChannelList,
  showMembersList,
  setShowMembersList
}) => {
  const handleToggleChannelList = () => {
    if (onToggleChannelList) {
      onToggleChannelList(!showChannelList);
    } else if (setShowChannelList) {
      setShowChannelList(!showChannelList);
    }
  };

  // Determine connection status
  const connectionStatus = reconnecting ? 'Reconnecting...' : 
                          (isConnected && isOnline) ? 'Connected' : 'Connecting...';
  const connectionIcon = reconnecting ? WifiOff : 
                        (isConnected && isOnline) ? Wifi : WifiOff;
  const connectionColor = reconnecting ? 'text-yellow-600 dark:text-yellow-400' :
                         (isConnected && isOnline) ? 'text-green-600 dark:text-green-400' : 
                         'text-red-600 dark:text-red-400';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleChannelList}
            className="h-8 w-8 p-0"
          >
            <Menu size={18} />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Hash size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-slate-100 capitalize flex items-center gap-2">
              {activeChannel}
              <MessageCircle size={16} className="text-slate-500" />
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Community discussion
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-2 ${connectionColor}`}>
          {React.createElement(connectionIcon, { className: "h-4 w-4" })}
          <span className="text-sm font-medium">{connectionStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
