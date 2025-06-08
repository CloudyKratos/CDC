
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, Search, Bell, Settings } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const getChannelDescription = (channelName: string) => {
    const descriptions = {
      'general': "Welcome to the main community hub - Share ideas and connect",
      'entrepreneurs': "Entrepreneurial discussions and business insights",
      'tech-talk': "Technology discussions and development topics",
      'motivation': "Daily motivation and success stories",
      'resources': "Useful tools, links, and learning materials",
      'announcements': "Important community updates and news"
    };
    return descriptions[channelName as keyof typeof descriptions] || `Discussion channel for ${channelName}`;
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
          {activeChannel === 'announcements' && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
              📢 Important
            </Badge>
          )}
          {reconnecting && (
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              Reconnecting...
            </Badge>
          )}
          {!isOnline && !reconnecting && (
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
              Offline
            </Badge>
          )}
        </div>
        <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
        <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
          {getChannelDescription(activeChannel)}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          {isOnline ? 'Connected' : 'Disconnected'}
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
