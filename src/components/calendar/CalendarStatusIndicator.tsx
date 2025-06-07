
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface CalendarStatusIndicatorProps {
  isOnline?: boolean;
  lastSync?: Date;
  hasErrors?: boolean;
  isLoading?: boolean;
  eventCount?: number;
}

export const CalendarStatusIndicator: React.FC<CalendarStatusIndicatorProps> = ({
  isOnline = true,
  lastSync,
  hasErrors = false,
  isLoading = false,
  eventCount = 0
}) => {
  const getStatusColor = () => {
    if (hasErrors) return 'destructive';
    if (isLoading) return 'secondary';
    if (!isOnline) return 'outline';
    return 'default';
  };

  const getStatusIcon = () => {
    if (hasErrors) return <AlertCircle className="h-3 w-3" />;
    if (isLoading) return <Clock className="h-3 w-3" />;
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  const getStatusText = () => {
    if (hasErrors) return 'Error';
    if (isLoading) return 'Loading...';
    if (!isOnline) return 'Offline';
    return `${eventCount} events`;
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        {getStatusText()}
      </Badge>
      
      {lastSync && !hasErrors && !isLoading && (
        <span className="text-xs">
          Updated {formatLastSync(lastSync)}
        </span>
      )}
      
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>
    </div>
  );
};
