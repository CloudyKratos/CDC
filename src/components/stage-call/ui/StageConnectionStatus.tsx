
import React from 'react';

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
  return (
    <>
      {/* Enhanced connection status indicator */}
      <div className="absolute top-20 right-4 text-sm text-white/70 space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionState === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="font-medium">Stage: {connectionState}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            networkQuality.quality === 'excellent' || networkQuality.quality === 'good' 
              ? 'bg-green-400' : networkQuality.quality === 'fair' 
              ? 'bg-yellow-400' : 'bg-red-400'
          }`}></div>
          <span>Quality: {networkQuality.quality}</span>
        </div>
        <div className="text-xs space-y-1">
          <div>Participants: {participantCount}</div>
          <div>Ping: {networkQuality.ping.toFixed(0)}ms</div>
          <div>Bandwidth: {(networkQuality.bandwidth / 1000).toFixed(1)}Mbps</div>
        </div>
      </div>

      {/* Real-time quality indicator */}
      {networkQuality.quality === 'poor' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <span className="text-sm font-medium">⚠️ Poor connection quality detected</span>
        </div>
      )}
    </>
  );
};
