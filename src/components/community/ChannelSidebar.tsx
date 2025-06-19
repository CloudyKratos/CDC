
import React from 'react';
import { Hash } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  description: string;
  type?: string;
  members?: any[];
}

interface ChannelSidebarProps {
  channels: Channel[];
  activeChannel: string;
  onChannelSelect: (channelName: string) => void;
  isMobile: boolean;
  showChannelList: boolean;
  onToggleChannelList?: (show: boolean) => void;
  setShowChannelList?: (show: boolean) => void;
  isLoading?: boolean;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isMobile,
  showChannelList,
  onToggleChannelList,
  setShowChannelList,
  isLoading = false
}) => {
  if (!showChannelList && isMobile) return null;

  const handleToggleChannelList = (show: boolean) => {
    if (onToggleChannelList) {
      onToggleChannelList(show);
    } else if (setShowChannelList) {
      setShowChannelList(show);
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-6">
        <Hash className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">
          Channels
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => {
                onChannelSelect(channel.name);
                if (isMobile) handleToggleChannelList(false);
              }}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeChannel === channel.name
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="font-medium">#{channel.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {channel.description}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChannelSidebar;
