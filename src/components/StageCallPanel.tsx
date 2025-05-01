import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Hand, Mic, MicOff } from "lucide-react"; // Changed from HandRaised to Hand

interface StageCallPanelProps {
  userName: string;
  avatarUrl: string;
  isMuted: boolean;
  onToggleMute: () => void;
  onRaiseHand: () => void;
}

const StageCallPanel: React.FC<StageCallPanelProps> = ({
  userName,
  avatarUrl,
  isMuted,
  onToggleMute,
  onRaiseHand,
}) => {
  return (
    <Card className="w-full p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{userName}</span>
      </div>
      <div className="space-x-2">
        <Button variant="outline" size="icon" onClick={onToggleMute}>
          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={onRaiseHand}>
          <Hand className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

export default StageCallPanel;
