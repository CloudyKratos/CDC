
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, X, Users } from 'lucide-react';

// Define interfaces for backward compatibility
interface Channel {
  id?: string;
  name: string;
  description?: string;
  memberCount?: number;
  type?: any;
  members?: any[];
  avatar?: string;
  lastMessage?: string | any;
  unreadCount?: number;
  isArchived?: boolean;
  isPinned?: boolean;
}

interface ChannelSidebarProps {
  activeChannel: string;
  onChannelSelect: (channel: string) => void;
  onClose?: () => void;
  channels?: Channel[]; // Added for backward compatibility
  isLoading?: boolean; // Added for backward compatibility
  isMobile?: boolean; // Added for backward compatibility
  showChannelList?: boolean; // Added for backward compatibility
  setShowChannelList?: (show: boolean) => void; // Added for backward compatibility
  onToggleChannelList?: (show: boolean) => void; // Added for backward compatibility
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  onClose,
  channels,
  isLoading = false,
  isMobile = false,
  showChannelList = true,
  setShowChannelList,
  onToggleChannelList
}) => {
  // Default channels if none provided
  const defaultChannels = [
    { name: 'general', description: 'General discussion', memberCount: 12 },
    { name: 'announcements', description: 'Official announcements', memberCount: 45 },
    { name: 'support', description: 'Help and support', memberCount: 8 },
    { name: 'random', description: 'Random conversations', memberCount: 23 },
    { name: 'dev', description: 'Development talk', memberCount: 15 }
  ];

  // Use provided channels or default ones
  const displayChannels = channels && channels.length > 0 ? channels : defaultChannels;

  // Handle close action
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (setShowChannelList) {
      setShowChannelList(false);
    } else if (onToggleChannelList) {
      onToggleChannelList(false);
    }
  };

  // Don't render if mobile and showChannelList is false
  if (isMobile && !showChannelList) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">
              Channels
            </h2>
          </div>
          {(onClose || setShowChannelList || onToggleChannelList) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className={isMobile ? "lg:hidden" : ""}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="text-center p-4 text-gray-500">
            Loading channels...
          </div>
        ) : (
          <div className="space-y-1">
            {displayChannels.map((channel) => {
              const channelName = channel.name;
              const channelId = channel.id || channel.name;
              const memberCount = channel.memberCount || channel.members?.length || 0;
              
              return (
                <button
                  key={channelId}
                  onClick={() => onChannelSelect(channelName)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeChannel === channelName
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="h-4 w-4" />
                    <span className="font-medium">{channelName}</span>
                    {memberCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {memberCount}
                      </Badge>
                    )}
                    {channel.unreadCount && channel.unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-xs">
                        {channel.unreadCount}
                      </Badge>
                    )}
                  </div>
                  {channel.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {channel.description}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Real-time community chat
        </p>
      </div>
    </div>
  );
};

export default ChannelSidebar;
