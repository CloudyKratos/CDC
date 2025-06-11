
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Users, Menu, Wifi, WifiOff, AlertCircle } from 'lucide-react';

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
  const getChannelDisplayName = () => {
    return activeChannel.replace(/-/g, ' ');
  };

  const getConnectionStatus = () => {
    if (reconnecting) return { icon: AlertCircle, text: 'Reconnecting...', color: 'text-amber-500' };
    if (isOnline) return { icon: Wifi, text: 'Connected', color: 'text-green-500' };
    return { icon: WifiOff, text: 'Disconnected', color: 'text-red-500' };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      {/* Left side - Channel info */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChannelList(!showChannelList)}
            className="h-8 w-8 p-0"
          >
            <Menu size={18} />
          </Button>
        )}
        
        {/* Channel name */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Hash size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {getChannelDisplayName()}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Community discussion
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Status and controls */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full">
          <StatusIcon size={14} className={status.color} />
          <span className={`text-xs font-medium ${status.color}`}>
            {status.text}
          </span>
        </div>

        {/* Members button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMembersList(!showMembersList)}
          className="h-8 w-8 p-0 hidden md:flex"
        >
          <Users size={18} />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
