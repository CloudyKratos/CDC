
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Wifi, WifiOff, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionIndicatorProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const ConnectionIndicator: React.FC<ConnectionIndicatorProps> = ({
  isConnected,
  isReconnecting = false,
  onRetry,
  className
}) => {
  if (isReconnecting) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Reconnecting...
        </Badge>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <WifiOff className="h-3 w-3 mr-1" />
        Disconnected
      </Badge>
      
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}
    </div>
  );
};
