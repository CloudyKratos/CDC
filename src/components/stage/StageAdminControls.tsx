
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Mic, 
  MicOff, 
  VideoOff, 
  Crown, 
  Settings,
  Timer,
  BarChart3,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner';

interface StageAdminControlsProps {
  participants: any[];
  onMuteParticipant: (userId: string) => void;
  onPromoteToSpeaker: (userId: string) => void;
  onDemoteToListener: (userId: string) => void;
  onRemoveParticipant: (userId: string) => void;
  engagementStats: {
    totalReactions: number;
    speakingTime: Record<string, number>;
    handRaises: number;
  };
}

const StageAdminControls: React.FC<StageAdminControlsProps> = ({
  participants,
  onMuteParticipant,
  onPromoteToSpeaker,
  onDemoteToListener,
  onRemoveParticipant,
  engagementStats
}) => {
  const [sessionTimer, setSessionTimer] = useState(0);

  const speakers = participants.filter(p => p.role === 'speaker' || p.role === 'host');
  const listeners = participants.filter(p => p.role === 'listener');

  return (
    <div className="space-y-4">
      {/* Live Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Live Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{speakers.length}</div>
              <div className="text-sm text-muted-foreground">Speakers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{listeners.length}</div>
              <div className="text-sm text-muted-foreground">Listeners</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{engagementStats.totalReactions}</div>
              <div className="text-sm text-muted-foreground">Reactions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{engagementStats.handRaises}</div>
              <div className="text-sm text-muted-foreground">Hand Raises</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Speaker Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mic className="h-5 w-5" />
            Speaker Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {speakers.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  {participant.role === 'host' && (
                    <Crown className="h-4 w-4 text-yellow-500" />
                  )}
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Speaking: {Math.round((engagementStats.speakingTime[participant.id] || 0) / 60)}min
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {participant.isMuted && (
                    <MicOff className="h-4 w-4 text-red-500" />
                  )}
                  {!participant.isVideoEnabled && (
                    <VideoOff className="h-4 w-4 text-red-500" />
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMuteParticipant(participant.id)}
                    disabled={participant.role === 'host'}
                  >
                    {participant.isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  
                  {participant.role !== 'host' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDemoteToListener(participant.id)}
                    >
                      Move to Audience
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Listener Queue */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Audience Queue ({listeners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {listeners.map((participant) => (
              <div key={participant.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{participant.name}</span>
                  {participant.hasRequestedToSpeak && (
                    <Badge variant="secondary" className="text-xs">
                      ✋ Requesting
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPromoteToSpeaker(participant.id)}
                    className="text-xs"
                  >
                    Invite to Speak
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="text-xs"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            {listeners.length === 0 && (
              <div className="text-center text-muted-foreground py-4">
                No listeners in the audience
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StageAdminControls;
