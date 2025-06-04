
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff,
  Hand,
  Users,
  Settings,
  Monitor,
  Volume2,
  VolumeX,
  Crown,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  avatarUrl?: string;
  stream?: MediaStream;
}

interface RealTimeStageCallProps {
  stageId: string;
  onLeave: () => void;
}

const RealTimeStageCall: React.FC<RealTimeStageCallProps> = ({
  stageId,
  onLeave
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [userStageRole, setUserStageRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  
  const { user } = useAuth();
  const { currentRole } = useRole();

  useEffect(() => {
    initializeStageCall();
    return () => {
      cleanup();
    };
  }, [stageId]);

  const initializeStageCall = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Determine user's stage role based on their system role
      let stageRole: 'speaker' | 'audience' | 'moderator' = 'audience';
      if (currentRole === 'admin') {
        stageRole = 'moderator';
      }
      setUserStageRole(stageRole);
      
      // Get local media stream - only enable video for speakers/moderators
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: stageRole !== 'audience'
        });
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (mediaError) {
        console.error('Error accessing media devices:', mediaError);
        toast.error('Could not access camera/microphone');
      }
      
      // Load existing participants
      const stageParticipants = await StageService.getStageParticipants(stageId);
      const formattedParticipants = stageParticipants.map(p => ({
        id: p.user_id,
        name: p.profiles?.full_name || 'Unknown',
        role: p.role as 'speaker' | 'audience' | 'moderator',
        isAudioEnabled: !p.is_muted,
        isVideoEnabled: p.is_video_enabled || false,
        isMuted: p.is_muted || false,
        isHandRaised: p.is_hand_raised || false,
        avatarUrl: p.profiles?.avatar_url
      }));
      
      setParticipants(formattedParticipants);
      setConnectionStatus('connected');
      toast.success('Connected to stage call');
      
      // Set up real-time participant updates
      const channel = StageService.subscribeToParticipants(stageId, handleParticipantUpdate);
      
      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize stage call:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to stage call');
    }
  };

  const handleParticipantUpdate = async () => {
    // Reload participants when there are updates
    const stageParticipants = await StageService.getStageParticipants(stageId);
    const formattedParticipants = stageParticipants.map(p => ({
      id: p.user_id,
      name: p.profiles?.full_name || 'Unknown',
      role: p.role as 'speaker' | 'audience' | 'moderator',
      isAudioEnabled: !p.is_muted,
      isVideoEnabled: p.is_video_enabled || false,
      isMuted: p.is_muted || false,
      isHandRaised: p.is_hand_raised || false,
      avatarUrl: p.profiles?.avatar_url
    }));
    
    setParticipants(formattedParticipants);
  };

  const toggleAudio = async () => {
    try {
      const newState = !isAudioEnabled;
      
      // Update local stream
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = newState;
        });
      }
      
      setIsAudioEnabled(newState);
      
      // Update in database
      if (user) {
        await StageService.toggleMute(stageId, user.id, !newState);
      }
      
      toast.success(newState ? 'Microphone enabled' : 'Microphone muted');
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      toast.error('Failed to toggle microphone');
    }
  };

  const toggleVideo = async () => {
    try {
      const newState = !isVideoEnabled;
      
      // Update local stream
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = newState;
        });
      }
      
      setIsVideoEnabled(newState);
      toast.success(newState ? 'Camera enabled' : 'Camera disabled');
    } catch (error) {
      console.error('Failed to toggle video:', error);
      toast.error('Failed to toggle camera');
    }
  };

  const toggleHandRaise = async () => {
    try {
      const newState = !isHandRaised;
      setIsHandRaised(newState);
      
      // Update in database
      await StageService.raiseHand(stageId, newState);
      
      toast.success(newState ? 'Hand raised' : 'Hand lowered');
    } catch (error) {
      console.error('Failed to toggle hand raise:', error);
      toast.error('Failed to update hand raise status');
    }
  };

  const startScreenShare = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setIsScreenSharing(true);
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
    toast.success('Screen sharing stopped');
  };

  const leaveCall = async () => {
    try {
      cleanup();
      onLeave();
      toast.success('Left stage call');
    } catch (error) {
      console.error('Failed to leave stage:', error);
      toast.error('Failed to leave stage');
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setParticipants([]);
  };

  const canSpeak = userStageRole === 'moderator' || userStageRole === 'speaker';
  const canModerate = userStageRole === 'moderator';

  const speakers = participants.filter(p => p.role === 'speaker' || p.role === 'moderator');
  const listeners = participants.filter(p => p.role === 'audience');

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
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
            <span>{participants.length} participants</span>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={leaveCall}
          className="gap-2 shadow-lg"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full max-w-7xl mx-auto">
          {/* Local Video */}
          <Card className={`relative overflow-hidden transition-all duration-300 ${activeSpeaker === user?.id ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
            <CardContent className="p-0 aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!isVideoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">You</Badge>
                {userStageRole === 'moderator' && <Crown className="h-3 w-3 text-yellow-500" />}
                {!isAudioEnabled && <MicOff className="h-3 w-3 text-red-500" />}
                {!isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                {isHandRaised && <Hand className="h-3 w-3 text-yellow-500 animate-bounce" />}
              </div>
            </CardContent>
          </Card>

          {/* Remote Videos - Speakers First */}
          {speakers.map((participant) => (
            <Card key={participant.id} className={`relative overflow-hidden transition-all duration-300 ${activeSpeaker === participant.id ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
              <CardContent className="p-0 aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative">
                <video
                  ref={(el) => {
                    if (el) {
                      remoteVideoRefs.current.set(participant.id, el);
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!participant.isVideoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={participant.avatarUrl} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <Badge variant={participant.role === 'speaker' ? 'default' : 'secondary'} className="text-xs">
                    {participant.name}
                  </Badge>
                  {participant.role === 'moderator' && <Crown className="h-3 w-3 text-yellow-500" />}
                  {!participant.isAudioEnabled && <MicOff className="h-3 w-3 text-red-500" />}
                  {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                  {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-500 animate-bounce" />}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Listeners (showing first few if space allows) */}
          {listeners.slice(0, Math.max(0, 8 - speakers.length)).map((participant) => (
            <Card key={participant.id} className="relative overflow-hidden opacity-75">
              <CardContent className="p-0 aspect-video bg-gradient-to-br from-slate-700 to-slate-600 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={participant.avatarUrl} />
                    <AvatarFallback className="text-xs">{participant.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-background/80">
                    {participant.name}
                  </Badge>
                  {participant.isHandRaised && <Hand className="h-3 w-3 text-yellow-500 animate-bounce" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-6 border-t bg-card/50 backdrop-blur-sm">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          disabled={!canSpeak}
          className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          disabled={!canSpeak}
          className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
        >
          {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>

        {!canSpeak && (
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            onClick={toggleHandRaise}
            className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Hand className={`h-6 w-6 ${isHandRaised ? 'animate-bounce' : ''}`} />
          </Button>
        )}

        {canSpeak && (
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
          >
            <Monitor className="h-6 w-6" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={leaveCall}
          className="rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default RealTimeStageCall;
