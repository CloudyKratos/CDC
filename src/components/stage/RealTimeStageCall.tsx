
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  VolumeX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import EnhancedWebRTCService from '@/services/EnhancedWebRTCService';
import { toast } from 'sonner';

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
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

  useEffect(() => {
    // Set up WebRTC event listeners
    EnhancedWebRTCService.on('remoteStream', handleRemoteStream);
    EnhancedWebRTCService.on('connectionStateChange', handleConnectionStateChange);
    
    return () => {
      EnhancedWebRTCService.off('remoteStream', handleRemoteStream);
      EnhancedWebRTCService.off('connectionStateChange', handleConnectionStateChange);
    };
  }, []);

  const initializeStageCall = async () => {
    try {
      await EnhancedWebRTCService.initialize();
      
      // Get local media stream
      const stream = await EnhancedWebRTCService.getLocalStream(true, currentRole !== 'audience');
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      // Load existing participants
      const stageParticipants = await StageService.getStageParticipants(stageId);
      setParticipants(stageParticipants.map(p => ({
        id: p.user_id,
        name: p.profiles?.full_name || 'Unknown',
        role: p.role as 'speaker' | 'audience' | 'moderator',
        isAudioEnabled: !p.is_muted,
        isVideoEnabled: p.is_video_enabled || false,
        isMuted: p.is_muted || false,
        isHandRaised: p.is_hand_raised || false
      })));
      
      setConnectionStatus('connected');
      toast.success('Connected to stage call');
    } catch (error) {
      console.error('Failed to initialize stage call:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to stage call');
    }
  };

  const handleRemoteStream = ({ participantId, stream }: { participantId: string, stream: MediaStream }) => {
    const videoElement = remoteVideoRefs.current.get(participantId);
    if (videoElement) {
      videoElement.srcObject = stream;
    }
    
    setParticipants(prev => prev.map(p => 
      p.id === participantId ? { ...p, stream } : p
    ));
  };

  const handleConnectionStateChange = ({ participantId, state }: { participantId: string, state: string }) => {
    console.log(`Connection state for ${participantId}: ${state}`);
    
    if (state === 'connected') {
      toast.success(`Connected to ${participantId}`);
    } else if (state === 'disconnected' || state === 'failed') {
      toast.error(`Lost connection to ${participantId}`);
    }
  };

  const toggleAudio = async () => {
    try {
      const newState = !isAudioEnabled;
      EnhancedWebRTCService.toggleAudio(newState);
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
      EnhancedWebRTCService.toggleVideo(newState);
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
      const displayStream = await EnhancedWebRTCService.getDisplayMedia();
      setIsScreenSharing(true);
      
      // Replace video track in all peer connections
      // Implementation would involve updating all peer connections with the new track
      
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      toast.error('Failed to start screen sharing');
    }
  };

  const stopScreenShare = () => {
    setIsScreenSharing(false);
    // Restore camera feed
    // Implementation would involve switching back to camera stream
    toast.success('Screen sharing stopped');
  };

  const leaveCall = async () => {
    try {
      await StageService.leaveStage(stageId);
      cleanup();
      onLeave();
      toast.success('Left stage call');
    } catch (error) {
      console.error('Failed to leave stage:', error);
      toast.error('Failed to leave stage');
    }
  };

  const cleanup = () => {
    EnhancedWebRTCService.cleanup();
    setLocalStream(null);
    setParticipants([]);
  };

  const canSpeak = currentRole === 'moderator' || currentRole === 'speaker';
  const canModerate = currentRole === 'moderator';

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            {connectionStatus}
          </Badge>
          <h1 className="text-lg font-semibold">Stage Call</h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{participants.length} participants</span>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm"
          onClick={leaveCall}
          className="gap-2"
        >
          <PhoneOff className="h-4 w-4" />
          Leave
        </Button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
          {/* Local Video */}
          <Card className="relative">
            <CardContent className="p-0 aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 flex items-center gap-2">
                <Badge variant="secondary">You</Badge>
                {!isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                {!isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                {isHandRaised && <Hand className="h-4 w-4 text-yellow-500" />}
              </div>
            </CardContent>
          </Card>

          {/* Remote Videos */}
          {participants.map((participant) => (
            <Card key={participant.id} className="relative">
              <CardContent className="p-0 aspect-video bg-black rounded-lg overflow-hidden">
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
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                  <Badge variant={participant.role === 'speaker' ? 'default' : 'secondary'}>
                    {participant.name}
                  </Badge>
                  {participant.role === 'moderator' && <Settings className="h-4 w-4 text-blue-500" />}
                  {!participant.isAudioEnabled && <MicOff className="h-4 w-4 text-red-500" />}
                  {!participant.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-500" />}
                  {participant.isHandRaised && <Hand className="h-4 w-4 text-yellow-500" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 border-t bg-muted/20">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          disabled={!canSpeak}
          className="rounded-full w-12 h-12"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          disabled={!canSpeak}
          className="rounded-full w-12 h-12"
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        {!canSpeak && (
          <Button
            variant={isHandRaised ? "default" : "outline"}
            size="lg"
            onClick={toggleHandRaise}
            className="rounded-full w-12 h-12"
          >
            <Hand className="h-5 w-5" />
          </Button>
        )}

        {canSpeak && (
          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="lg"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
            className="rounded-full w-12 h-12"
          >
            <Monitor className="h-5 w-5" />
          </Button>
        )}

        <Button
          variant="destructive"
          size="lg"
          onClick={leaveCall}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default RealTimeStageCall;
