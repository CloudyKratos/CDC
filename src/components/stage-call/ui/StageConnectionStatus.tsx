
import React from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';

interface StageConnectionStatusProps {
  connectionState: string;
  networkQuality: {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    ping: number;
    bandwidth: number;
  };
  participantCount: number;
}

export const StageConnectionStatus: React.FC<StageConnectionStatusProps> = ({
  connectionState,
  networkQuality,
  participantCount
}) => {
  const getStatusIcon = () => {
    if (connectionState === 'connected') {
      return <Wifi className="w-3 h-3 text-green-400 animate-pulse" />;
    }
    return <WifiOff className="w-3 h-3 text-red-400" />;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getQualityIcon = (quality: string) => {
    const baseClass = "w-3 h-3";
    const colorClass = getQualityColor(quality);
    
    if (quality === 'poor') {
      return <AlertTriangle className={`${baseClass} ${colorClass} animate-pulse`} />;
    }
    return <div className={`${baseClass} rounded-full bg-current ${colorClass}`}></div>;
  };

  return (
    <>
      {/* Enhanced connection status indicator */}
      <div className="absolute top-20 right-4 text-sm text-white/80 space-y-3 bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg min-w-[200px]">
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className="font-medium capitalize">{connectionState}</span>
          {connectionState === 'connected' && (
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          )}
        </div>
        
        {/* Network Quality */}
        <div className="flex items-center gap-3">
          {getQualityIcon(networkQuality.quality)}
          <span className={`capitalize ${getQualityColor(networkQuality.quality)}`}>
            {networkQuality.quality} quality
          </span>
        </div>
        
        {/* Network Stats */}
        <div className="text-xs space-y-2 pt-2 border-t border-white/10">
          <div className="flex justify-between">
            <span className="text-white/60">Participants:</span>
            <span className="font-medium">{participantCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Latency:</span>
            <span className="font-medium">{networkQuality.ping.toFixed(0)}ms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Bandwidth:</span>
            <span className="font-medium">{(networkQuality.bandwidth / 1000).toFixed(1)}Mbps</span>
          </div>
        </div>
      </div>

      {/* Poor connection warning */}
      {networkQuality.quality === 'poor' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse border border-red-500/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm font-medium">Poor connection detected</span>
          </div>
          <p className="text-xs mt-1 text-red-100">
            Audio/video quality may be affected. Try moving closer to your router.
          </p>
        </div>
      )}

      {/* Reconnection indicator */}
      {connectionState === 'reconnecting' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-600/90 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse border border-yellow-500/50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Reconnecting...</span>
          </div>
        </div>
      )}
    </>
  );
};
