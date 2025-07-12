import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Volume2,
  VolumeX,
  MonitorSpeaker,
  Headphones,
  Radio,
  Camera,
  ScreenShare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

interface RoundtableStageCallProps {
  stageId: string;
  onLeave: () => void;
  userRole: string;
}

interface Reaction {
  id: string;
  type: 'thumbs-up' | 'heart' | 'laugh' | 'fire';
  userId: string;
  timestamp: Date;
}

const RoundtableStageCall: React.FC<RoundtableStageCallProps> = ({
  stageId,
  onLeave,
  userRole
}) => {
  const [stageCall, setStageCall] = useState<StageCall | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<ParticipantRole>(ParticipantRole.LISTENER);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'spotlight'>('grid');
  const [spotlightUserId, setSpotlightUserId] = useState<string | null>(null);
  const [showListeners, setShowListeners] = useState(true);
  
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const { user } = useAuth();

  const isHost = currentUserRole === ParticipantRole.HOST;
  const isSpeaker = currentUserRole === ParticipantRole.SPEAKER || isHost;
  const isListener = currentUserRole === ParticipantRole.LISTENER;

  useEffect(() => {
    initializeStageCall();
    return () => {
      if (user) {
        VideoCallService.leaveStageCall(stageId, user.id);
      }
    };
  }, [stageId]);

  const initializeStageCall = async () => {
    try {
      if (!user) {
        toast.error('Please log in to join a stage');
        return;
      }

      // Create a proper user object for the VideoCallService
      const userForService = {
        id: user.id,
        name: user.name || user.email?.split('@')[0] || 'Anonymous User',
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        email: user.email || '',
        role: 'user' as const,
        permissions: [] as string[]
      };
      
      const call = await VideoCallService.joinStageCall(stageId, userForService, true);
      
      setStageCall(call);
      const userRole = VideoCallService.getCurrentUserRole(stageId);
      if (userRole) {
        setCurrentUserRole(userRole);
        setIsMuted(userRole === ParticipantRole.LISTENER);
        setIsVideoEnabled(userRole !== ParticipantRole.LISTENER);
      }
    } catch (error) {
      console.error('Failed to join stage call:', error);
      toast.error('Failed to join stage call');
    }
  };

  const handleToggleMute = () => {
    if (isListener) {
      toast.error('Listeners cannot unmute. Request to speak first.');
      return;
    }
    if (!user) return;
    
    const newMuteState = !isMuted;
    VideoCallService.muteParticipant(stageId, user.id, newMuteState);
    setIsMuted(newMuteState);
    toast.success(newMuteState ? 'Muted' : 'Unmuted');
  };

  const handleToggleVideo = () => {
    if (isListener) {
      toast.error('Listeners cannot enable video. Request to speak first.');
      return;
    }
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleRaiseHand = () => {
    if (!isListener || !user) return;
    
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    
    if (newState) {
      VideoCallService.requestToSpeak(stageId, user.id);
      toast.success('Hand raised! Waiting for host approval.');
    } else {
      toast.success('Hand lowered.');
    }
  };

  const handlePromoteToSpeaker = (userId: string) => {
    VideoCallService.approveRequestToSpeak(stageId, userId, true);
    toast.success('User promoted to speaker');
  };

  const handleDemoteToListener = (userId: string) => {
    // Implementation would update participant role
    toast.success('User moved to audience');
  };

  const handleMuteParticipant = (userId: string) => {
    VideoCallService.muteParticipant(stageId, userId, true);
    toast.success('Participant muted');
  };

  const handleReaction = (type: Reaction['type']) => {
    if (!user) return;
    
    const reaction: Reaction = {
      id: `reaction-${Date.now()}`,
      type,
      userId: user.id,
      timestamp: new Date()
    };
    
    setReactions(prev => [...prev, reaction]);
    
    // Remove reaction after 3 seconds
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 3000);
    
    toast.success(`Sent ${type} reaction`);
  };

  const handleToggleRecording = () => {
    if (!isHost) {
      toast.error('Only hosts can control recording');
      return;
    }
    
    setIsRecording(!isRecording);
    toast.success(isRecording ? 'Recording stopped' : 'Recording started');
  };

  const renderParticipantVideo = (participant: StageParticipant, isSpotlight = false) => {
    const isCurrentUser = user && participant.id === user.id;
    const showVideo = participant.isVideoEnabled && !participant.isMuted;
    const cardSize = isSpotlight ? 'h-64 w-96' : 'h-32 w-48';
    
    return (
      <Card key={participant.id} className={`relative ${cardSize} overflow-hidden bg-gray-900`}>
        <CardContent className="p-0 h-full">
          {showVideo ? (
            <div className="relative h-full w-full bg-gray-800 flex items-center justify-center">
              <video
                ref={el => el && (videoRefs.current[participant.id] = el)}
                className="h-full w-full object-cover"
                autoPlay
                muted={isCurrentUser}
                playsInline
              />
              {participant.isSpeaking && (
                <div className="absolute inset-0 border-4 border-green-400 rounded-lg animate-pulse" />
              )}
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-800">
              <Avatar className="h-16 w-16">
                <AvatarImage src={participant.avatar} />
                <AvatarFallback>{participant.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Participant Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {participant.role === ParticipantRole.HOST && (
                  <Crown className="h-4 w-4 text-yellow-500" />
                )}
                {participant.role === ParticipantRole.SPEAKER && (
                  <Mic className="h-4 w-4 text-green-500" />
                )}
                <span className="text-white text-sm font-medium truncate">
                  {participant.name}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {participant.isMuted && (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}
                {!participant.isVideoEnabled && (
                  <VideoOff className="h-4 w-4 text-red-500" />
                )}
                {participant.hasRequestedToSpeak && (
                  <Hand className="h-4 w-4 text-orange-500 animate-bounce" />
                )}
              </div>
            </div>
          </div>
          
          {/* Host Controls */}
          {isHost && !isCurrentUser && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black/40">
                    <MoreVertical className="h-4 w-4 text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {participant.role === ParticipantRole.LISTENER && (
                    <DropdownMenuItem onClick={() => handlePromoteToSpeaker(participant.id)}>
                      Promote to Speaker
                    </DropdownMenuItem>
                  )}
                  {participant.role === ParticipantRole.SPEAKER && (
                    <DropdownMenuItem onClick={() => handleDemoteToListener(participant.id)}>
                      Move to Audience
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleMuteParticipant(participant.id)}>
                    Mute Participant
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSpotlightUserId(participant.id)}>
                    Spotlight
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!stageCall) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Loading stage call...</h3>
        </div>
      </div>
    );
  }

  const speakers = stageCall.participants.filter(p => 
    [ParticipantRole.HOST, ParticipantRole.SPEAKER].includes(p.role)
  );
  const listeners = stageCall.participants.filter(p => 
    p.role === ParticipantRole.LISTENER
  );
  const spotlightParticipant = spotlightUserId 
    ? stageCall.participants.find(p => p.id === spotlightUserId)
    : null;

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Floating Reactions */}
      <div className="absolute top-4 right-4 z-50 pointer-events-none">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="animate-bounce text-2xl mb-2 opacity-90"
            style={{ animationDuration: '0.5s' }}
          >
            {reaction.type === 'thumbs-up' && '👍'}
            {reaction.type === 'heart' && '❤️'}
            {reaction.type === 'laugh' && '😂'}
            {reaction.type === 'fire' && '🔥'}
          </div>
        ))}
      </div>

      {/* Stage Header */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </Badge>
            <h1 className="text-xl font-bold">{stageCall.name}</h1>
            {isRecording && (
              <Badge variant="secondary" className="gap-1">
                <div className="h-3 w-3 text-red-500" />
                Recording
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                Grid
              </Button>
              <Button
                variant={viewMode === 'spotlight' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('spotlight')}
                className="rounded-l-none"
              >
                Spotlight
              </Button>
            </div>
            
            {/* Host Controls */}
            {isHost && (
              <>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  onClick={handleToggleRecording}
                  className="gap-2"
                >
                  <div className="h-4 w-4" />
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowListeners(!showListeners)}
                  className="gap-2"
                >
                  <Users className="h-4 w-4" />
                  {showListeners ? 'Hide' : 'Show'} Audience
                </Button>
              </>
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
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{speakers.length} speakers</span>
          <span>{listeners.length} in audience</span>
          <span>Started {stageCall.startTime.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Main Stage Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Speakers Section */}
        <div className="flex-1 p-4">
          {viewMode === 'spotlight' && spotlightParticipant ? (
            <div className="flex flex-col items-center h-full">
              <div className="mb-4">
                {renderParticipantVideo(spotlightParticipant, true)}
              </div>
              <div className="flex gap-2 flex-wrap justify-center">
                {speakers
                  .filter(p => p.id !== spotlightUserId)
                  .map(participant => renderParticipantVideo(participant))}
              </div>
            </div>
          ) : (
            <div className="h-full">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                SPEAKERS ON STAGE ({speakers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {speakers.map(participant => renderParticipantVideo(participant))}
              </div>
            </div>
          )}
        </div>

        {/* Audience Sidebar */}
        {showListeners && listeners.length > 0 && (
          <>
            <Separator orientation="vertical" />
            <div className="w-80 p-4 bg-muted/30">
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                AUDIENCE ({listeners.length})
              </h3>
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {listeners.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback>
                            {participant.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{participant.name}</span>
                        {participant.hasRequestedToSpeak && (
                          <Hand className="h-4 w-4 text-orange-500 animate-bounce" />
                        )}
                      </div>
                      
                      {isHost && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteToSpeaker(participant.id)}
                          className="text-xs"
                        >
                          Invite
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        )}
      </div>

      {/* Stage Controls */}
      <div className="p-4 border-t bg-card">
        <div className="flex items-center justify-center gap-4">
          {/* Core Controls */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isMuted ? "destructive" : "default"}
                  size="lg"
                  onClick={handleToggleMute}
                  disabled={isListener}
                  className="gap-2"
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListener ? 'Request to speak first' : (isMuted ? 'Unmute' : 'Mute')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isVideoEnabled ? "default" : "outline"}
                  size="lg"
                  onClick={handleToggleVideo}
                  disabled={isListener}
                  className="gap-2"
                >
                  {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListener ? 'Request to speak first' : (isVideoEnabled ? 'Turn off camera' : 'Turn on camera')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Raise Hand (Listeners only) */}
          {isListener && (
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

          <Separator orientation="vertical" className="h-8" />

          {/* Reactions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('thumbs-up')}
              className="text-lg"
            >
              👍
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('heart')}
              className="text-lg"
            >
              ❤️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('laugh')}
              className="text-lg"
            >
              😂
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReaction('fire')}
              className="text-lg"
            >
              🔥
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundtableStageCall;
