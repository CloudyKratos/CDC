
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Users, Wifi, WifiOff } from 'lucide-react';

interface StageHeaderProps {
  status: 'connecting' | 'connected' | 'disconnected';
  participantCount: number;
  onLeave: () => void;
}

export const StageHeader: React.FC<StageHeaderProps> = ({
  status,
  participantCount,
  onLeave
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="bg-green-500 text-white gap-2">
            <Wifi className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="secondary" className="gap-2">
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
            Connecting...
          </Badge>
        );
      default:
        return (
          <Badge variant="destructive" className="gap-2">
            <WifiOff className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="flex items-center gap-4">
        <h1 className="text-white text-xl font-semibold">Stage Call</h1>
        {getStatusBadge()}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-white/80">
          <Users className="h-4 w-4" />
          <span className="text-sm">{participantCount} participant{participantCount !== 1 ? 's' : ''}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onLeave}
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
};
