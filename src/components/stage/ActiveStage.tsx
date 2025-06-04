
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
  VolumeX,
  Video,
  VideoOff
} from 'lucide-react';
import StageService, { StageRole } from '@/services/StageService';
import SpeakerRequestModal from './SpeakerRequestModal';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

type Stage = Database['public']['Tables']['stages']['Row'];

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
  const [participants, setParticipants] = useState<any[]>([]);
  const [userParticipant, setUserParticipant] = useState<any>(null);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showSpeakerRequests, setShowSpeakerRequests] = useState(false);

  const { user } = useAuth();
  const isAdmin = userRole === 'admin';
  const isModerator = userRole === 'moderator' || isAdmin;

  useEffect(() => {
    loadStageData();
    setupRealTimeSubscriptions();
    
    // Auto-start the stage if it's scheduled and user is creator
    if (stage?.status === 'scheduled' && stage?.creator_id === user?.id) {
      StageService.updateStageStatus(stageId, 'live');
    }
  }, [stageId, user?.id]);

  const loadStageData = async () => {
    try {
      const [stageData, participantsData] = await Promise.all([
        StageService.getStageById(stageId),
        StageService.getStageParticipants(stageId)
      ]);
      
      setStage(stageData);
      setParticipants(participantsData);
      
      // Find current user's participation
      const userParticipation = participantsData.find(p => p.user_id === user?.id);
      if (userParticipation) {
        setUserParticipant(userParticipation);
        setIsHandRaised(userParticipation.is_hand_raised || false);
        setIsMuted(userParticipation.is_muted || true);
        setIsVideoEnabled(userParticipation.is_video_enabled || false);
      }
    } catch (error) {
      console.error('Error loading stage data:', error);
      toast.error('Failed to load stage data');
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

  const canManageStage = isModerator || (stage?.creator_id === user?.id);

  const handleRaiseHand = async () => {
    if (!user) return;
    
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
    if (!user || userParticipant?.role === 'audience') {
      toast.error('Audience members cannot unmute');
      return;
    }

    const newMuteState = !isMuted;
    const success = await StageService.toggleMute(stageId, user.id, newMuteState);
    
    if (success) {
      setIsMuted(newMuteState);
      toast.success(newMuteState ? 'Muted' : 'Unmuted');
    } else {
      toast.error('Failed to toggle mute');
    }
  };

  const handleToggleVideo = async () => {
    if (!user || userParticipant?.role === 'audience') {
      toast.error('Audience members cannot enable video');
      return;
    }

    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, this would control the video stream
    toast.success(isVideoEnabled ? 'Video disabled' : 'Video enabled');
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

  const getParticipantName = (participant: any) => {
    return participant.profiles?.full_name || 
           participant.profiles?.username || 
           `User ${participant.user_id.slice(0, 8)}`;
  };

  const getParticipantAvatar = (participant: any) => {
    return participant.profiles?.avatar_url || 
           `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.user_id}`;
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
            <Badge variant={stage.status === 'live' ? 'destructive' : 'secondary'} className="gap-1">
              {stage.status === 'live' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              {stage.status.toUpperCase()}
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
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <span>{speakers.length} speakers</span>
          <span>{audience.length} in audience</span>
          {stage.scheduled_start_time && (
            <span>Scheduled: {new Date(stage.scheduled_start_time).toLocaleString()}</span>
          )}
        </div>
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
                        <AvatarImage src={getParticipantAvatar(participant)} />
                        <AvatarFallback>
                          {getParticipantName(participant).slice(0, 2).toUpperCase()}
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
                          {getParticipantName(participant)}
                        </span>
                      </div>
                    </div>
                    
                    {canManageStage && participant.role === 'speaker' && participant.user_id !== user?.id && (
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
                        <AvatarImage src={getParticipantAvatar(participant)} />
                        <AvatarFallback>
                          {getParticipantName(participant).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <span className="text-sm">
                        {getParticipantName(participant)}
                      </span>
                      
                      {participant.is_hand_raised && (
                        <Hand className="h-4 w-4 text-orange-500 animate-bounce" />
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
          </Button>

          <Button
            variant={isVideoEnabled ? "default" : "outline"}
            size="lg"
            onClick={handleToggleVideo}
            disabled={userParticipant?.role === 'audience'}
            className="gap-2"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
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
