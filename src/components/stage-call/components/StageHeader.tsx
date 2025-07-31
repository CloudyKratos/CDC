
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Settings, PhoneOff, Wifi, WifiOff } from 'lucide-react';

interface StageHeaderProps {
  stageId: string;
  connectionState: string;
  participantCount: number;
  networkQuality: { quality: string; ping: number; bandwidth: number };
  onToggleSidebar: () => void;
  onLeave: () => void;
}

const StageHeader: React.FC<StageHeaderProps> = ({
  stageId,
  connectionState,
  participantCount,
  networkQuality,
  onToggleSidebar,
  onLeave
}) => {
  const getConnectionBadge = () => {
    switch (connectionState) {
      case 'connected':
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            Connecting...
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            Disconnected
          </Badge>
        );
    }
  };

  const getQualityIcon = () => {
    if (networkQuality.quality === 'good') {
      return <Wifi className="w-4 h-4 text-green-400" />;
    }
    return <WifiOff className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-4">
        {getConnectionBadge()}
        
        <div className="flex items-center gap-2 text-white/80">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">{participantCount} participants</span>
        </div>

        <div className="flex items-center gap-2 text-white/60">
          {getQualityIcon()}
          <span className="text-xs">{networkQuality.ping}ms</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="text-white/80 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={onLeave}
        >
          <PhoneOff className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
};

export default StageHeader;
