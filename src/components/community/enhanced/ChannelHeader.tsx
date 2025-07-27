
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Users, Bell, BellOff, Star, StarOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChannelHeaderProps {
  channelName: string;
  description?: string;
  memberCount?: number;
  isNotificationEnabled?: boolean;
  isFavorite?: boolean;
  onToggleNotifications?: () => void;
  onToggleFavorite?: () => void;
  onSettings?: () => void;
  className?: string;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channelName,
  description,
  memberCount = 0,
  isNotificationEnabled = true,
  isFavorite = false,
  onToggleNotifications,
  onToggleFavorite,
  onSettings,
  className = ''
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700",
      className
    )}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg flex-shrink-0">
          <Hash className="w-5 h-5 text-white" />
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg text-gray-900 dark:text-gray-100 capitalize truncate">
              {channelName}
            </h2>
            {isFavorite && (
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {memberCount > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span className="text-xs">{memberCount}</span>
          </Badge>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleFavorite}
          className="h-8 w-8 p-0"
        >
          {isFavorite ? (
            <StarOff className="w-4 h-4" />
          ) : (
            <Star className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleNotifications}
          className="h-8 w-8 p-0"
        >
          {isNotificationEnabled ? (
            <Bell className="w-4 h-4" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="h-8 w-8 p-0"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
