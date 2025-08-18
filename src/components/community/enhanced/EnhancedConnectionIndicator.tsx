import React from 'react';
import { Wifi, WifiOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedConnectionIndicatorProps {
  isConnected: boolean;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'disconnected';
  onReconnect?: () => void;
  className?: string;
}

export const EnhancedConnectionIndicator: React.FC<EnhancedConnectionIndicatorProps> = ({
  isConnected,
  connectionHealth,
  onReconnect,
  className = ''
}) => {
  const getIndicatorConfig = () => {
    switch (connectionHealth) {
      case 'excellent':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Connected',
          description: 'Real-time messaging active'
        };
      case 'good':
        return {
          icon: Wifi,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: 'Connected',
          description: 'Good connection quality'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          label: 'Poor Connection',
          description: 'Messages may be delayed'
        };
      case 'disconnected':
      default:
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Disconnected',
          description: 'Unable to send messages'
        };
    }
  };

  const config = getIndicatorConfig();
  const Icon = config.icon;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
      config.bgColor,
      config.borderColor,
      className
    )}>
      <div className={cn(
        "p-2 rounded-full",
        config.bgColor
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm font-medium",
          config.color
        )}>
          {config.label}
        </p>
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>

      {connectionHealth === 'poor' || connectionHealth === 'disconnected' ? (
        <button
          onClick={onReconnect}
          className={cn(
            "px-3 py-1 text-xs font-medium rounded-md transition-colors",
            "hover:bg-white/50 dark:hover:bg-gray-800/50",
            config.color
          )}
        >
          Reconnect
        </button>
      ) : null}
    </div>
  );
};