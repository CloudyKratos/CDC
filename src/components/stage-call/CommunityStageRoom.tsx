
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Crown,
  UserPlus,
  Share
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { toast } from 'sonner';

interface CommunityStageRoomProps {
  stageId: string;
  callTitle?: string;
  isHost?: boolean;
  onLeave: () => void;
}

const CommunityStageRoom: React.FC<CommunityStageRoomProps> = ({ 
  stageId, 
  callTitle = 'Community Call',
  isHost = false,
  onLeave 
}) => {
  const { user } = useAuth();
  const { 
    state, 
    isInitialized, 
    initializeStage, 
    leaveStage, 
    toggleAudio, 
    toggleVideo 
  } = useStageOrchestrator();

  const [participants, setParticipants] = useState([
    { id: '1', name: 'Host User', role: 'host', isSpeaking: true },
    { id: '2', name: 'John Doe', role: 'speaker', isSpeaking: false },
    { id: '3', name: 'Jane Smith', role: 'audience', isSpeaking: false },
  ]);
  
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
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
      toast.error('Please log in to join the call');
      return;
    }

    try {
      console.log('Initializing community stage connection:', stageId);
      
      // Get user media
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

      // Initialize stage
      const result = await initializeStage({
        stageId,
        userId: user.id,
        userRole: isHost ? 'moderator' : 'audience',
        mediaConstraints: {
          audio: true,
          video: true
        },
        enableSecurity: true,
        enableCompliance: true
      });

      if (result.success) {
        toast.success('Connected to community call!');
      } else {
        throw new Error(result.error || 'Failed to initialize stage');
      }

    } catch (error) {
      console.error('Error initializing community stage:', error);
      toast.error('Failed to connect to call');
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

  const handleInviteParticipants = () => {
    const inviteUrl = `${window.location.origin}/stage/${stageId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  const handleLeaveCall = async () => {
    try {
      await cleanup();
      await leaveStage();
      onLeave();
      toast.success('Left call successfully');
    } catch (error) {
      console.error('Error leaving call:', error);
      toast.error('Error leaving call');
      onLeave();
    }
  };

  const cleanup = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setParticipants([]);
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Joining {callTitle}</h3>
              <p className="text-muted-foreground">Setting up your connection...</p>
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/20 text-green-600 border-green-500/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                Live
              </Badge>
              <h1 className="text-lg font-semibold">{callTitle}</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{participants.length} participants</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isHost && (
              <>
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Host
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInviteParticipants}
                  className="flex items-center gap-2"
                >
                  <Share className="w-4 h-4" />
                  Invite
                </Button>
              </>
            )}
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

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              
              {/* Local Video */}
              <Card className="relative aspect-video bg-muted/20 border-border/50 overflow-hidden group">
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
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium">You</p>
                          <p className="text-xs text-muted-foreground">Camera off</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary text-primary-foreground">
                    You {isHost && '(Host)'}
                  </Badge>
                </div>
                
                <div className="absolute top-3 right-3 flex gap-1">
                  {state.mediaState.audioEnabled ? (
                    <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                      <Mic className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center">
                      <MicOff className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </Card>

              {/* Placeholder for other participants */}
              {Array.from({ length: Math.min(5, 8 - participants.length) }).map((_, index) => (
                <Card key={`placeholder-${index}`} className="relative aspect-video bg-muted/10 border-dashed border-2 border-muted-foreground/20 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <UserPlus className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground/60">Waiting for participants</p>
                  </div>
                </Card>
              ))}

            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        <div className="w-64 bg-background/50 border-l border-border/50 p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Participants ({participants.length})
          </h3>
          
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/20">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{participant.name}</p>
                  <div className="flex items-center gap-1">
                    {participant.role === 'host' && <Crown className="w-3 h-3 text-yellow-500" />}
                    <span className="text-xs text-muted-foreground capitalize">{participant.role}</span>
                  </div>
                </div>
                {participant.isSpeaking && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
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
            className="w-14 h-14 rounded-full"
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
            className="w-14 h-14 rounded-full"
          >
            {state.mediaState.videoEnabled ? 
              <Video className="w-5 h-5" /> : 
              <VideoOff className="w-5 h-5" />
            }
          </Button>

          {!isHost && (
            <Button
              onClick={handleRaiseHand}
              size="lg"
              variant={isHandRaised ? "default" : "outline"}
              className="w-14 h-14 rounded-full"
            >
              <Hand className={`w-5 h-5 ${isHandRaised ? 'animate-bounce' : ''}`} />
            </Button>
          )}

          <Separator orientation="vertical" className="h-8 mx-2" />

          <Button
            onClick={handleLeaveCall}
            variant="destructive"
            className="px-6"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            Leave Call
          </Button>
        </div>
        
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Connecting...'} • Call ID: {stageId.slice(0, 8)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityStageRoom;
