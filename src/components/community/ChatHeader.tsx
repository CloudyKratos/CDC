
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash, Menu, MessageCircle, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  activeChannel: string;
  isConnected: boolean;
  isMobile: boolean;
  showChannelList: boolean;
  onToggleChannelList: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChannel,
  isConnected,
  isMobile,
  showChannelList,
  onToggleChannelList
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleChannelList(!showChannelList)}
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
        {isConnected ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Connecting...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
