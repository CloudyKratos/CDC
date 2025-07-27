
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Signal, 
  SignalHigh, 
  SignalMedium, 
  SignalLow 
} from 'lucide-react';

interface ConnectionQualityIndicatorProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'disconnected';
  ping?: number;
  bandwidth?: number;
  className?: string;
}

const ConnectionQualityIndicator: React.FC<ConnectionQualityIndicatorProps> = ({
  quality,
  ping = 0,
  bandwidth = 0,
  className = ''
}) => {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [quality]);

  const getQualityConfig = () => {
    switch (quality) {
      case 'excellent':
        return {
          icon: SignalHigh,
          color: 'text-green-500',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          label: 'Excellent',
          description: 'HD quality'
        };
      case 'good':
        return {
          icon: Signal,
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500/30',
          label: 'Good',
          description: 'High quality'
        };
      case 'fair':
        return {
          icon: SignalMedium,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/30',
          label: 'Fair',
          description: 'Standard quality'
        };
      case 'poor':
        return {
          icon: SignalLow,
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/30',
          label: 'Poor',
          description: 'Low quality'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          label: 'Disconnected',
          description: 'Reconnecting...'
        };
      default:
        return {
          icon: Wifi,
          color: 'text-muted-foreground',
          bgColor: 'bg-muted/20',
          borderColor: 'border-muted/30',
          label: 'Unknown',
          description: 'Checking...'
        };
    }
  };

  const config = getQualityConfig();
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge 
        variant="outline" 
        className={`${config.bgColor} ${config.color} ${config.borderColor} transition-all duration-300`}
        key={animationKey}
      >
        <Icon className={`w-3 h-3 mr-1.5 ${quality === 'disconnected' ? 'animate-pulse' : ''}`} />
        <span className="font-medium">{config.label}</span>
      </Badge>
      
      {(ping > 0 || bandwidth > 0) && (
        <div className="text-xs text-muted-foreground space-x-2">
          {ping > 0 && <span>{ping}ms</span>}
          {bandwidth > 0 && <span>{Math.round(bandwidth / 1024)}kb/s</span>}
        </div>
      )}
    </div>
  );
};

export default ConnectionQualityIndicator;
