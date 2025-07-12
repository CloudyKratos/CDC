import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Users, 
  Settings,
  Hand,
  MessageSquare,
  Share2,
  MoreVertical,
  Crown,
  UserPlus,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';

interface StageCallManagerProps {
  stageId: string;
}

const StageCallManager: React.FC<StageCallManagerProps> = ({ stageId }) => {
  const { user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [participants, setParticipants] = useState([
    { id: '1', name: 'Alice', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: '2', name: 'Bob', avatar: 'https://i.pravatar.cc/150?img=2' },
    { id: '3', name: 'Charlie', avatar: 'https://i.pravatar.cc/150?img=3' },
  ]);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseInt(event.target.value));
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const addParticipant = () => {
    const newParticipant = {
      id: String(participants.length + 1),
      name: `User ${participants.length + 1}`,
      avatar: `https://i.pravatar.cc/150?img=${participants.length + 1}`,
    };
    setParticipants([...participants, newParticipant]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Stage Call: {stageId}
          <Badge variant={isLive ? 'success' : 'secondary'}>
            {isLive ? 'Live' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {/* Participants List */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold mb-2">Participants ({participants.length})</h4>
          <ScrollArea className="h-32">
            <div className="flex flex-col gap-2">
              {participants.map(participant => (
                <div key={participant.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.avatar} alt={participant.name} />
                      <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{participant.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeParticipant(participant.id)}>
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-around border-t pt-4">
          <Button variant="outline" size="icon" onClick={toggleMic}>
            {isMicOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleCamera}>
            {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          <Button variant="destructive" onClick={toggleLive}>
            {isLive ? 'End Call' : 'Go Live'}
          </Button>
          <Button variant="outline" size="icon" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default StageCallManager;
