import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  Phone,
  PhoneOff
} from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

interface StageRoomPanelProps {
  roomId?: string;
}

const StageRoomPanel: React.FC<StageRoomPanelProps> = ({ roomId = 'default-room' }) => {
  const { user } = useAuth();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRaisedHand, setIsRaisedHand] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 'user1', name: 'Alice', avatarUrl: 'https://i.pravatar.cc/150?img=1' },
    { id: 'user2', name: 'Bob', avatarUrl: 'https://i.pravatar.cc/150?img=2' },
    { id: 'user3', name: 'Charlie', avatarUrl: 'https://i.pravatar.cc/150?img=3' },
  ]);

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleHand = () => {
    setIsRaisedHand(!isRaisedHand);
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Stage Room: {roomId}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {/* Participants List */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Participants ({participants.length})</h4>
          <ScrollArea className="h-[200px] pr-2">
            <div className="space-y-2">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={participant.avatarUrl} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{participant.name}</span>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Controls */}
        <div className="mt-auto">
          <h4 className="text-sm font-semibold mb-2">Controls</h4>
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={toggleMic}>
                {isMicOn ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={toggleCamera}>
                {isCameraOn ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </Button>
              <Button variant="secondary" size="icon" onClick={toggleHand}>
                {isRaisedHand ? <Hand className="h-4 w-4" /> : <Hand className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon">
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon">
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageRoomPanel;
