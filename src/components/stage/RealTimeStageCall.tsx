
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Users,
  Hand,
  Monitor,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import StageService from '@/services/StageService';
import RefactoredStageWebRTCService from '@/services/webrtc/RefactoredStageWebRTCService';

interface RealTimeStageCallProps {
  stageId: string;
  onLeave: () => void;
}

interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised?: boolean;
}

const RealTimeStageCall: React.FC<RealTimeStageCallProps> = ({
  stageId,
  onLeave
}) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [userRole, setUserRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    initializeStage();
    return () => {
      cleanup();
    };
  }, [stageId]);

  const initializeStage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive"
        });
        return;
      }

      // Join the stage
      const joinResult = await StageService.joinStage(stageId, 'audience');
      if (!joinResult.success) {
        throw new Error(joinResult.error);
      }

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC
      await RefactoredStageWebRTCService.initialize(stream);
      
      // Set up remote stream handler
      RefactoredStageWebRTCService.onRemoteStream((userId: string, stream: MediaStream) => {
        setRemoteStreams(prev => {
          const newMap = new Map(prev);
          newMap.set(userId, stream);
          return newMap;
        });
      });

      // Connect to existing users
      await RefactoredStageWebRTCService.connectToExistingUsers();

      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: "You've joined the stage successfully"
      });

    } catch (error) {
      console.error('Error initializing stage:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to stage",
        variant: "destructive"
      });
    }
  };

  const toggleAudio = async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        // Update participant status
        await StageService.toggleMute(stageId, 'current-user', !audioTrack.enabled);
      }
    }
  };

  const toggleVideo = async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const raiseHand = async () => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    await StageService.raiseHand(stageId, newHandState);
    
    toast({
      title: newHandState ? "Hand Raised" : "Hand Lowered",
      description: newHandState ? "The moderator will see your request" : "Hand lowered"
    });
  };

  const leaveStage = async () => {
    await cleanup();
    onLeave();
  };

  const cleanup = async () => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      RefactoredStageWebRTCService.cleanup();
      await StageService.leaveStage(stageId);
      
      setIsConnected(false);
      setRemoteStreams(new Map());
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-black">
        <Card className="w-96 animate-scale-in">
          <CardContent className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Connecting to Stage</h3>
            <p className="text-muted-foreground">Setting up your audio and video...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
            Live
          </Badge>
          <div className="flex items-center gap-2 text-white/80">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{participants.length + 1} participants</span>
          </div>
        </div>
        
        <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {userRole}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Local Video */}
            <Card className="relative aspect-video bg-gray-800 border-gray-700 overflow-hidden group animate-scale-in">
              {isVideoEnabled ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">You</span>
                  </div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                <div className="absolute top-2 left-2">
                  <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    You
                  </Badge>
                </div>
                
                <div className="absolute top-2 right-2 flex gap-1">
                  {isAudioEnabled ? (
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Mic className="w-3 h-3 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                      <MicOff className="w-3 h-3 text-red-400" />
                    </div>
                  )}
                  
                  {isVideoEnabled ? (
                    <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Video className="w-3 h-3 text-green-400" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                      <VideoOff className="w-3 h-3 text-red-400" />
                    </div>
                  )}
                </div>
                
                {isHandRaised && (
                  <div className="absolute bottom-2 right-2">
                    <Hand className="w-5 h-5 text-yellow-400 animate-bounce" />
                  </div>
                )}
              </div>
            </Card>

            {/* Remote Participants */}
            {Array.from(remoteStreams.entries()).map(([userId, stream], index) => (
              <Card key={userId} className="relative aspect-video bg-gray-800 border-gray-700 overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                <video
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                  ref={(videoEl) => {
                    if (videoEl) videoEl.srcObject = stream;
                  }}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                  <div className="absolute bottom-2 left-2">
                    <p className="text-white text-sm font-medium">Participant {userId.slice(0, 8)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/40 backdrop-blur-lg border-t border-white/10 p-4">
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleAudio}
            size="lg"
            variant={isAudioEnabled ? "default" : "destructive"}
            className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
          >
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>

          <Button
            onClick={toggleVideo}
            size="lg"
            variant={isVideoEnabled ? "default" : "destructive"}
            className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
          >
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          {userRole === 'audience' && (
            <Button
              onClick={raiseHand}
              size="lg"
              variant={isHandRaised ? "default" : "outline"}
              className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
            >
              <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
            </Button>
          )}

          <Button
            size="lg"
            variant="outline"
            className="w-12 h-12 rounded-full hover-scale transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            onClick={leaveStage}
            variant="destructive"
            className="ml-8 hover-scale transition-all duration-200"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave Stage
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RealTimeStageCall;
