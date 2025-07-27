
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  connectionAttempts?: number;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isConnected,
  isReconnecting = false,
  connectionAttempts = 0,
  onRetry,
  className = ''
}) => {
  const getStatus = () => {
    if (isReconnecting) return 'reconnecting';
    if (isConnected) return 'connected';
    return 'disconnected';
  };

  const status = getStatus();

  const statusConfig = {
    connected: {
      icon: Wifi,
      text: 'Connected',
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    },
    reconnecting: {
      icon: RefreshCw,
      text: 'Reconnecting...',
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected',
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge className={cn("flex items-center gap-1.5 px-2 py-1", config.className)}>
        <Icon className={cn(
          "w-3 h-3",
          isReconnecting && "animate-spin"
        )} />
        <span className="text-xs font-medium">{config.text}</span>
        {connectionAttempts > 0 && (
          <span className="text-xs opacity-75">({connectionAttempts})</span>
        )}
      </Badge>
      
      {!isConnected && !isReconnecting && onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          Retry
        </Button>
      )}
    </div>
  );
};
