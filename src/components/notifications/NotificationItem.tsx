
import React from 'react';
import { Notification } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { 
  Calendar, 
  Users, 
  Settings, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ExternalLink,
  X
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
  compact?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
  compact = false
}) => {
  const getIcon = () => {
    switch (notification.category) {
      case 'calendar':
        return <Calendar className="h-4 w-4" />;
      case 'community':
        return <Users className="h-4 w-4" />;
      case 'system':
        return <Settings className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-300 dark:bg-orange-900/20 dark:border-orange-800';
      case 'medium':
        return 'bg-blue-100 border-blue-300 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleAction = () => {
    if (notification.action_url && onAction) {
      onAction(notification.action_url);
      handleMarkAsRead();
    }
  };

  return (
    <div
      className={`
        border rounded-lg p-4 transition-all duration-200 hover:shadow-md
        ${notification.read ? 'opacity-75' : getPriorityColor()}
        ${compact ? 'p-3' : 'p-4'}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Category Icon */}
        <div className={`
          p-2 rounded-lg flex-shrink-0
          ${notification.read 
            ? 'bg-gray-100 dark:bg-gray-800' 
            : 'bg-white dark:bg-gray-900 shadow-sm'
          }
        `}>
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {getTypeIcon()}
              <h4 className={`
                font-medium text-sm
                ${notification.read 
                  ? 'text-gray-600 dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
                }
              `}>
                {notification.title}
              </h4>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <p className={`
            text-sm mt-1 leading-relaxed
            ${notification.read 
              ? 'text-gray-500 dark:text-gray-500' 
              : 'text-gray-700 dark:text-gray-300'
            }
          `}>
            {notification.message}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {notification.category}
              </Badge>
              {notification.priority !== 'medium' && (
                <Badge 
                  variant={notification.priority === 'urgent' || notification.priority === 'high' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {notification.action_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={handleAction}
                >
                  {notification.action_text || 'View'}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
              {!notification.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={handleMarkAsRead}
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
