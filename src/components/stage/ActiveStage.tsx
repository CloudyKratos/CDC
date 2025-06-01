
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Hand, 
  Users, 
  Settings, 
  LogOut,
  Crown,
  Shield,
  Volume2,
  VolumeX
} from 'lucide-react';
import StageService, { StageRole } from '@/services/StageService';
import SpeakerRequestModal from './SpeakerRequestModal';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Stage = Database['public']['Tables']['stages']['Row'];
type StageParticipant = Database['public']['Tables']['stage_participants']['Row'];

interface ActiveStageProps {
  stageId: string;
  onLeave: () => void;
  userRole: string;
}

const ActiveStage: React.FC<ActiveStageProps> = ({
  stageId,
  onLeave,
  userRole
}) => {
  const [stage, setStage] = useState<Stage | null>(null);
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [userParticipant, setUserParticipant] = useState<StageParticipant | null>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showSpeakerRequests, setShowSpeakerRequests] = useState(false);

  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;
  const canManageStage = isModerator || (stage?.creator_id === userParticipant?.user_id);

  useEffect(() => {
    loadStageData();
    setupRealTimeSubscriptions();
  }, [stageId]);

  const loadStageData = async () => {
    const stageData = await StageService.getStageById(stageId);
    const participantsData = await StageService.getStageParticipants(stageId);
    
    setStage(stageData);
    setParticipants(participantsData);
    
    // Find current user's participation
    const userParticipation = participantsData.find(p => p.user_id === userParticipant?.user_id);
    if (userParticipation) {
      setUserParticipant(userParticipation);
      setIsHandRaised(userParticipation.is_hand_raised || false);
      setIsMuted(userParticipation.is_muted || true);
    }
  };

  const setupRealTimeSubscriptions = () => {
    const stageChannel = StageService.subscribeToStageUpdates(stageId, () => {
      loadStageData();
    });

    const participantsChannel = StageService.subscribeToParticipants(stageId, () => {
      loadStageData();
    });

    return () => {
      stageChannel.unsubscribe();
      participantsChannel.unsubscribe();
    };
  };

  const handleRaiseHand = async () => {
    const newState = !isHandRaised;
    const success = await StageService.raiseHand(stageId, newState);
    
    if (success) {
      setIsHandRaised(newState);
      if (newState) {
        await StageService.requestToSpeak(stageId);
        toast.success('Hand raised! Waiting for moderator approval.');
      } else {
        toast.success('Hand lowered.');
      }
    } else {
      toast.error('Failed to update hand status');
    }
  };

  const handleToggleMute = async () => {
    if (userParticipant?.role === 'audience') {
      toast.error('Audience members cannot unmute');
      return;
    }

    const newMuteState = !isMuted;
    const success = await StageService.toggleMute(stageId, userParticipant?.user_id || '', newMuteState);
    
    if (success) {
      setIsMuted(newMuteState);
      toast.success(newMuteState ? 'Muted' : 'Unmuted');
    } else {
      toast.error('Failed to toggle mute');
    }
  };

  const promoteToSpeaker = async (userId: string) => {
    const success = await StageService.updateParticipantRole(stageId, userId, 'speaker');
    if (success) {
      toast.success('User promoted to speaker');
      loadStageData();
    } else {
      toast.error('Failed to promote user');
    }
  };

  const demoteToAudience = async (userId: string) => {
    const success = await StageService.updateParticipantRole(stageId, userId, 'audience');
    if (success) {
      toast.success('User moved to audience');
      loadStageData();
    } else {
      toast.error('Failed to demote user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'speaker':
        return <Mic className="h-4 w-4 text-green-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const speakers = participants.filter(p => ['moderator', 'speaker'].includes(p.role));
  const audience = participants.filter(p => p.role === 'audience');

  if (!stage) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Loading stage...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Stage Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </Badge>
            <h1 className="text-xl font-bold">{stage.title}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {canManageStage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSpeakerRequests(true)}
                className="gap-2"
              >
                <Hand className="h-4 w-4" />
                Requests
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLeave}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Leave
            </Button>
          </div>
        </div>
        
        {stage.topic && (
          <p className="text-sm text-muted-foreground">#{stage.topic}</p>
        )}
        
        {stage.description && (
          <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
        )}
      </div>

      {/* Stage Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Stage Area */}
        <div className="flex-1 flex flex-col">
          {/* Speakers Section */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              SPEAKERS ({speakers.length})
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {speakers.map((participant) => (
                <Card key={participant.id} className="p-3">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`} />
                        <AvatarFallback>
                          {participant.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="absolute -bottom-1 -right-1">
                        {participant.is_muted ? (
                          <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                            <MicOff className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <Mic className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        {getRoleIcon(participant.role)}
                        <span className="text-sm font-medium truncate">
                          User {participant.user_id.slice(0, 8)}
                        </span>
                      </div>
                    </div>
                    
                    {canManageStage && participant.role === 'speaker' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => demoteToAudience(participant.user_id)}
                        className="text-xs"
                      >
                        Move to Audience
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Audience Section */}
          <div className="flex-1 p-4 overflow-hidden">
            <h3 className="text-sm font-medium mb-3 text-muted-foreground">
              AUDIENCE ({audience.length})
            </h3>
            
            <ScrollArea className="h-full">
              <div className="space-y-2">
                {audience.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`} />
                        <AvatarFallback>
                          {participant.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <span className="text-sm">
                        User {participant.user_id.slice(0, 8)}
                      </span>
                      
                      {participant.is_hand_raised && (
                        <Hand className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    
                    {canManageStage && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => promoteToSpeaker(participant.user_id)}
                        className="text-xs"
                      >
                        Invite to Speak
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Stage Controls */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isMuted ? "destructive" : "default"}
            size="lg"
            onClick={handleToggleMute}
            disabled={userParticipant?.role === 'audience'}
            className="gap-2"
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>
          
          {userParticipant?.role === 'audience' && (
            <Button
              variant={isHandRaised ? "secondary" : "outline"}
              size="lg"
              onClick={handleRaiseHand}
              className="gap-2"
            >
              <Hand className="h-5 w-5" />
              {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            </Button>
          )}
        </div>
      </div>

      {/* Speaker Request Modal */}
      <SpeakerRequestModal
        isOpen={showSpeakerRequests}
        onClose={() => setShowSpeakerRequests(false)}
        stageId={stageId}
        onApprove={promoteToSpeaker}
      />
    </div>
  );
};

export default ActiveStage;
