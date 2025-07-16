
import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  error?: string | null;
  onReconnect?: () => void;
  connectionHealth?: 'excellent' | 'good' | 'degraded' | 'poor';
}

export const EnhancedConnectionStatus: React.FC<EnhancedConnectionStatusProps> = ({
  isConnected,
  isLoading,
  error,
  onReconnect,
  connectionHealth = 'excellent'
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-800 dark:text-blue-300">Connecting...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          {onReconnect && (
            <Button variant="outline" size="sm" onClick={onReconnect} className="ml-2">
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <WifiOff className="h-4 w-4 text-red-600 dark:text-red-400" />
        <span className="text-sm text-red-800 dark:text-red-300">Disconnected</span>
        {onReconnect && (
          <Button variant="outline" size="sm" onClick={onReconnect} className="ml-2">
            Reconnect
          </Button>
        )}
      </div>
    );
  }

  const getConnectionDisplay = () => {
    switch (connectionHealth) {
      case 'excellent':
        return {
          icon: CheckCircle,
          text: 'Connected',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800'
        };
      case 'good':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800'
        };
      case 'degraded':
        return {
          icon: AlertTriangle,
          text: 'Limited',
          color: 'text-yellow-600 dark:text-yellow-400',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
      case 'poor':
        return {
          icon: WifiOff,
          text: 'Poor',
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800'
        };
      default:
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-green-600 dark:text-green-400',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800'
        };
    }
  };

  const { icon: Icon, text, color, bg, border } = getConnectionDisplay();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${bg} border ${border} rounded-lg`}>
      <Icon className={`h-4 w-4 ${color}`} />
      <span className={`text-sm ${color}`}>{text}</span>
    </div>
  );
};
