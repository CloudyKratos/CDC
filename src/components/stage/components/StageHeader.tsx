
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PhoneOff, Users } from 'lucide-react';

interface StageHeaderProps {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  participantCount: number;
  onLeave: () => void;
  onEndCall: () => void;
}

const StageHeader: React.FC<StageHeaderProps> = ({
  connectionStatus,
  participantCount,
  onLeave,
  onEndCall
}) => {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onLeave}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'} className="gap-1">
          {connectionStatus === 'connected' && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          {connectionStatus}
        </Badge>
        <h1 className="text-lg font-semibold">Live Stage</h1>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{participantCount} participants</span>
        </div>
      </div>
      
      <Button 
        variant="destructive" 
        size="sm"
        onClick={onEndCall}
        className="gap-2 shadow-lg"
      >
        <PhoneOff className="h-4 w-4" />
        Leave
      </Button>
    </div>
  );
};

export default StageHeader;
