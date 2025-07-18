
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw,
  Activity
} from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  connectionHealth: 'healthy' | 'degraded' | 'failed';
  isLoading: boolean;
  onReconnect: () => void;
  diagnostics?: {
    isHealthy: boolean;
    policyValidation: boolean;
    networkLatency: number;
    lastChecked: Date | null;
    errors: string[];
  };
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  connectionHealth,
  isLoading,
  onReconnect,
  diagnostics,
  className = ''
}) => {
  const getStatusConfig = () => {
    if (isLoading) {
      return {
        icon: RefreshCw,
        text: 'Connecting...',
        variant: 'outline' as const,
        className: 'text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
      };
    }

    if (!isConnected || connectionHealth === 'failed') {
      return {
        icon: WifiOff,
        text: 'Disconnected',
        variant: 'outline' as const,
        className: 'text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
      };
    }

    if (connectionHealth === 'degraded') {
      return {
        icon: AlertTriangle,
        text: 'Limited',
        variant: 'outline' as const,
        className: 'text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
      };
    }

    return {
      icon: Wifi,
      text: 'Connected',
      variant: 'outline' as const,
      className: 'text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
    };
  };

  const statusConfig = getStatusConfig();
  const Icon = statusConfig.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant={statusConfig.variant} 
        className={statusConfig.className}
      >
        <Icon className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        {statusConfig.text}
      </Badge>

      {/* Latency indicator */}
      {diagnostics?.networkLatency && diagnostics.networkLatency > 0 && (
        <Badge variant="outline" className="text-xs">
          <Activity className="h-3 w-3 mr-1" />
          {diagnostics.networkLatency}ms
        </Badge>
      )}

      {/* Reconnect button for failed connections */}
      {(!isConnected || connectionHealth === 'failed') && !isLoading && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReconnect}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      )}

      {/* Error count indicator */}
      {diagnostics?.errors && diagnostics.errors.length > 0 && (
        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
          {diagnostics.errors.length} error{diagnostics.errors.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};
