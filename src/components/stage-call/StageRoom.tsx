
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff,
  Hand,
  Users,
  Settings,
  Monitor,
  Camera,
  Volume2,
  VolumeX,
  MoreVertical,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { StageParticipant } from '@/services/core/types/StageTypes';
import { toast } from 'sonner';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const { 
    state, 
    isInitialized, 
    initializeStage, 
    leaveStage, 
    toggleAudio, 
    toggleVideo 
  } = useStageOrchestrator();

  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const isConnecting = state.isConnecting;
  const isConnected = state.isConnected;

  useEffect(() => {
    if (user && stageId) {
      initializeStageConnection();
    }

    return () => {
      cleanup();
    };
  }, [stageId, user]);

  const initializeStageConnection = async () => {
    if (!user) {
      toast.error('Please log in to join the stage');
      return;
    }

    try {
      console.log('Initializing stage connection:', stageId);
      
      // Get user media first
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize stage with orchestrator
      const result = await initializeStage({
        stageId,
        userId: user.id,
        userRole: 'audience',
        mediaConstraints: {
          audio: true,
          video: true
        },
        enableSecurity: true,
        enableCompliance: true
      });

      if (result.success) {
        toast.success('Connected to stage successfully!');
        console.log('Stage initialization successful');
      } else {
        throw new Error(result.error || 'Failed to initialize stage');
      }

    } catch (error) {
      console.error('Error initializing stage:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to stage');
    }
  };

  const handleToggleAudio = async () => {
    try {
      const enabled = await toggleAudio();
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      toast.success(`Microphone ${enabled ? 'enabled' : 'muted'}`);
    } catch (error) {
      toast.error('Failed to toggle audio');
    }
  };

  const handleToggleVideo = async () => {
    try {
      const enabled = await toggleVideo();
      if (localStream) {
        localStream.getVideoTracks().forEach(track => {
          track.enabled = enabled;
        });
      }
      toast.success(`Camera ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to toggle video');
    }
  };

  const handleRaiseHand = () => {
    setIsHandRaised(!isHandRaised);
    toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised');
  };

  const handleLeaveStage = async () => {
    try {
      await cleanup();
      await leaveStage();
      onLeave();
      toast.success('Left stage successfully');
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage');
      onLeave(); // Force leave even if there's an error
    }
  };

  const cleanup = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setRemoteStreams(new Map());
    setParticipants([]);
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md animate-scale-in">
          <CardContent className="p-8 text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Connecting to Stage</h3>
              <p className="text-muted-foreground">Setting up your audio and video...</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30 flex flex-col">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 p-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
              Live
            </Badge>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{participants.length + 1} participants</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Quality: {connectionQuality}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Audience
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast.info('Settings coming soon')}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 h-full">
            
            {/* Local Video */}
            <Card className="relative aspect-video bg-muted/20 border-border/50 overflow-hidden group animate-fade-in hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0">
                {state.mediaState.videoEnabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">You</p>
                        <p className="text-xs text-muted-foreground">Camera off</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    You
                  </Badge>
                </div>
                
                <div className="absolute top-3 right-3 flex gap-1">
                  {state.mediaState.audioEnabled ? (
                    <div className="w-7 h-7 bg-green-500/90 rounded-full flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-red-500/90 rounded-full flex items-center justify-center">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                {isHandRaised && (
                  <div className="absolute bottom-3 right-3">
                    <div className="w-8 h-8 bg-yellow-500/90 rounded-full flex items-center justify-center">
                      <Hand className="w-4 h-4 text-white animate-bounce" />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Remote Participants Placeholder */}
            {Array.from({ length: Math.min(5, Math.max(0, 7 - participants.length)) }).map((_, index) => (
              <Card key={`placeholder-${index}`} className="relative aspect-video bg-muted/10 border-dashed border-2 border-muted-foreground/20 overflow-hidden animate-fade-in flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Users className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm text-muted-foreground/60">Waiting for participants</p>
                </div>
              </Card>
            ))}

          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-background/80 backdrop-blur-lg border-t border-border/50 p-4">
        <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
          <Button
            onClick={handleToggleAudio}
            size="lg"
            variant={state.mediaState.audioEnabled ? "default" : "destructive"}
            className="w-14 h-14 rounded-full transition-all duration-200 hover:scale-105"
          >
            {state.mediaState.audioEnabled ? 
              <Mic className="w-5 h-5" /> : 
              <MicOff className="w-5 h-5" />
            }
          </Button>

          <Button
            onClick={handleToggleVideo}
            size="lg"
            variant={state.mediaState.videoEnabled ? "default" : "destructive"}
            className="w-14 h-14 rounded-full transition-all duration-200 hover:scale-105"
          >
            {state.mediaState.videoEnabled ? 
              <Video className="w-5 h-5" /> : 
              <VideoOff className="w-5 h-5" />
            }
          </Button>

          <Button
            onClick={handleRaiseHand}
            size="lg"
            variant={isHandRaised ? "default" : "outline"}
            className="w-14 h-14 rounded-full transition-all duration-200 hover:scale-105"
          >
            <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
          </Button>

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button
            onClick={handleLeaveStage}
            variant="destructive"
            className="px-6 transition-all duration-200 hover:scale-105"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave
          </Button>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Connecting...'} • Stage ID: {stageId.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StageRoom;
