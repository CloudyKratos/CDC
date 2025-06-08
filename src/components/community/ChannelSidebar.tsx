
import React from 'react';
import { Button } from '@/components/ui/button';
import { Hash } from 'lucide-react';
import { ChatChannel } from '@/types/chat';
import ServerSidebar from './ServerSidebar';

interface ChannelSidebarProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelSelect: (channelId: string) => void;
  isLoading: boolean;
  isMobile: boolean;
  showChannelList: boolean;
  setShowChannelList: (show: boolean) => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  channels,
  activeChannel,
  onChannelSelect,
  isLoading,
  isMobile,
  showChannelList,
  setShowChannelList
}) => {
  return (
    <>
      <div className={`${isMobile && !showChannelList ? 'hidden' : ''} ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-80' : 'w-80'} bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg`}>
        <ServerSidebar
          channels={channels}
          activeChannel={activeChannel}
          onChannelSelect={onChannelSelect}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile overlay */}
      {isMobile && showChannelList && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setShowChannelList(false)}
        />
      )}
    </>
  );
};

export default ChannelSidebar;
