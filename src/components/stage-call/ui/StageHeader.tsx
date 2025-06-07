
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Users, Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface StageHeaderProps {
  status: 'connected' | 'connecting' | 'disconnected';
  participantCount: number;
  onLeave: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  status,
  participantCount,
  onLeave
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting':
        return <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'connecting':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'disconnected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-white/80">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{participantCount} participants</span>
        </div>
      </div>

      <Button
        onClick={onLeave}
        variant="destructive"
        size="sm"
        className="bg-red-600 hover:bg-red-700"
      >
        <X className="w-4 h-4 mr-2" />
        Leave
      </Button>
    </div>
  );
};
