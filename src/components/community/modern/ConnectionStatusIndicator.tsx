
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalLow, 
  SignalMedium, 
  SignalHigh,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  connectionHealth?: 'excellent' | 'good' | 'degraded' | 'poor';
  isLoading?: boolean;
  onReconnect?: () => void;
  diagnostics?: {
    latency?: number;
    lastMessageTime?: string;
    connectionAttempts?: number;
  };
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  connectionHealth = 'excellent',
  isLoading = false,
  onReconnect,
  diagnostics,
  className = ""
}) => {
  const getSignalIcon = () => {
    if (!isConnected) return WifiOff;
    
    switch (connectionHealth) {
      case 'excellent':
        return SignalHigh;
      case 'good':
        return SignalMedium;
      case 'degraded':
        return SignalLow;
      case 'poor':
        return Signal;
      default:
        return Wifi;
    }
  };

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    
    switch (connectionHealth) {
      case 'excellent':
        return 'text-green-500';
      case 'good':
        return 'text-blue-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'poor':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (!isConnected) return 'Disconnected';
    
    switch (connectionHealth) {
      case 'excellent':
        return 'Excellent Connection';
      case 'good':
        return 'Good Connection';
      case 'degraded':
        return 'Degraded Connection';
      case 'poor':
        return 'Poor Connection';
      default:
        return 'Connected';
    }
  };

  const SignalIcon = getSignalIcon();
  const statusColor = getStatusColor();
  const statusText = getStatusText();

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <SignalIcon className={cn("h-4 w-4", statusColor)} />
          )}
          <span className={cn("text-sm font-medium", statusColor)}>
            {statusText}
          </span>
        </div>
        
        {diagnostics && (
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {diagnostics.latency && (
              <Badge variant="outline" className="text-xs">
                {diagnostics.latency}ms
              </Badge>
            )}
            {diagnostics.connectionAttempts && diagnostics.connectionAttempts > 1 && (
              <Badge variant="secondary" className="text-xs">
                Attempt {diagnostics.connectionAttempts}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {!isConnected && (
          <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Messages may not be delivered</span>
          </div>
        )}
        
        {onReconnect && !isLoading && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Reconnect
          </Button>
        )}
      </div>
    </div>
  );
};
