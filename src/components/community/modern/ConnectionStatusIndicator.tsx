
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh
} from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  isConnected: boolean;
  connectionHealth?: 'excellent' | 'good' | 'degraded' | 'poor';
  isLoading: boolean;
  onReconnect: () => void;
  diagnostics?: {
    lastPing?: number;
    reconnectAttempts?: number;
  };
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isConnected,
  connectionHealth = 'excellent',
  isLoading,
  onReconnect,
  diagnostics
}) => {
  const getConnectionIcon = () => {
    if (!isConnected) return WifiOff;
    
    switch (connectionHealth) {
      case 'poor': return SignalLow;
      case 'degraded': return SignalMedium;
      case 'good': return SignalHigh;
      case 'excellent': return Wifi;
      default: return Wifi;
    }
  };

  const getConnectionColor = () => {
    if (!isConnected) return 'text-red-500';
    
    switch (connectionHealth) {
      case 'poor': return 'text-red-500';
      case 'degraded': return 'text-yellow-500';
      case 'good': return 'text-blue-500';
      case 'excellent': return 'text-green-500';
      default: return 'text-green-500';
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Connecting...';
    if (!isConnected) return 'Disconnected';
    
    switch (connectionHealth) {
      case 'poor': return 'Poor connection';
      case 'degraded': return 'Limited connectivity';
      case 'good': return 'Good connection';
      case 'excellent': return 'Excellent connection';
      default: return 'Connected';
    }
  };

  const Icon = getConnectionIcon();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-2 ${getConnectionColor()}`}>
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{getStatusText()}</span>
        </div>
        
        {diagnostics && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {diagnostics.lastPing && (
              <span>Ping: {diagnostics.lastPing}ms</span>
            )}
            {diagnostics.reconnectAttempts && diagnostics.reconnectAttempts > 0 && (
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {diagnostics.reconnectAttempts} attempts
              </Badge>
            )}
          </div>
        )}
      </div>

      {(!isConnected || connectionHealth === 'poor') && (
        <div className="flex items-center gap-2">
          {connectionHealth === 'poor' && (
            <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs">Unstable</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReconnect}
            disabled={isLoading}
            className="h-8 px-3 text-xs rounded-lg hover:bg-muted/60"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
