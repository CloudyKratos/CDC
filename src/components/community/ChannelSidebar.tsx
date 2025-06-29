
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, X, Users } from 'lucide-react';

interface ChannelSidebarProps {
  activeChannel: string;
  onChannelSelect: (channel: string) => void;
  onClose: () => void;
}

const ChannelSidebar: React.FC<ChannelSidebarProps> = ({
  activeChannel,
  onChannelSelect,
  onClose
}) => {
  // Default channels for now
  const channels = [
    { name: 'general', description: 'General discussion', memberCount: 12 },
    { name: 'announcements', description: 'Official announcements', memberCount: 45 },
    { name: 'support', description: 'Help and support', memberCount: 8 },
    { name: 'random', description: 'Random conversations', memberCount: 23 },
    { name: 'dev', description: 'Development talk', memberCount: 15 }
  ];

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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Channel List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.name}
              onClick={() => onChannelSelect(channel.name)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeChannel === channel.name
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4" />
                <span className="font-medium">{channel.name}</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {channel.memberCount}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {channel.description}
              </p>
            </button>
          ))}
        </div>
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
