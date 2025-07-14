
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Hash, 
  Users, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  Settings,
  Search,
  Phone,
  Video,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  activeChannel: string;
  isOnline?: boolean;
  reconnecting?: boolean;
  isMobile?: boolean;
  showChannelList: boolean;
  setShowChannelList: (show: boolean) => void;
  showMembersList: boolean;
  setShowMembersList: (show: boolean) => void;
  isConnected?: boolean;
  onToggleChannelList?: (show: boolean) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeChannel,
  isOnline = true,
  reconnecting = false,
  isMobile = false,
  showChannelList,
  setShowChannelList,
  showMembersList,
  setShowMembersList,
  isConnected = true,
  onToggleChannelList
}) => {
  const getChannelDisplayName = () => {
    return activeChannel.replace(/-/g, ' ');
  };

  const getConnectionStatus = () => {
    if (reconnecting) return { status: 'Reconnecting...', color: 'text-yellow-600', icon: AlertTriangle };
    if (!isConnected || !isOnline) return { status: 'Offline', color: 'text-red-600', icon: WifiOff };
    return { status: 'Connected', color: 'text-green-600', icon: Wifi };
  };

  const connectionInfo = getConnectionStatus();
  const StatusIcon = connectionInfo.icon;

  const handleToggleChannelList = () => {
    const newValue = !showChannelList;
    setShowChannelList(newValue);
    onToggleChannelList?.(newValue);
  };

  return (
    <div className="flex-shrink-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      <div className="flex items-center justify-between p-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleChannelList}
              className="h-9 w-9 p-0 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}

          {/* Channel Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Hash className="h-5 w-5 text-white" />
            </div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                {getChannelDisplayName()}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Community discussion
                </p>
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                >
                  Public
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", connectionInfo.color)} />
            <span className={cn("text-sm font-medium hidden sm:inline", connectionInfo.color)}>
              {connectionInfo.status}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:inline-flex"
            >
              <Phone className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hidden sm:inline-flex"
            >
              <Video className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembersList(!showMembersList)}
              className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Users className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {reconnecting && (
        <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
            <div className="animate-spin rounded-full h-3 w-3 border border-yellow-600 border-t-transparent"></div>
            <span>Reconnecting to real-time chat...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
