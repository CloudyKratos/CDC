
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Hand, 
  Users, 
  Settings,
  Monitor,
  Phone,
  MessageSquare,
  MoreVertical,
  Volume2,
  VolumeX,
  Crown,
  Shield
} from 'lucide-react';
import { useStageConnection } from '@/hooks/useStageConnection';
import { toast } from 'sonner';

interface EnhancedStageRoomProps {
  stageId: string;
  onLeave: () => void;
}

interface Participant {
  id: string;
  userId: string;
  name: string;
  role: 'moderator' | 'speaker' | 'audience';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  joinedAt: string;
}

export const EnhancedStageRoom: React.FC<EnhancedStageRoomProps> = ({ 
  stageId, 
  onLeave 
}) => {
  const { isConnected, connect, disconnect, connectionState } = useStageConnection();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userRole, setUserRole] = useState<'moderator' | 'speaker' | 'audience'>('audience');
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  // Enhanced connection management
  useEffect(() => {
    const initializeStage = async () => {
      try {
        await connect(stageId);
      } catch (error) {
        console.error('Failed to connect to stage:', error);
        toast.error('Failed to connect to stage');
      }
    };

    initializeStage();

    return () => {
      disconnect();
    };
  }, [stageId, connect, disconnect]);

  // Simulated participants for demo
  useEffect(() => {
    const mockParticipants: Participant[] = [
      {
        id: '1',
        userId: 'user1',
        name: 'John Doe',
        role: 'moderator',
        isAudioEnabled: true,
        isVideoEnabled: true,
        isHandRaised: false,
        connectionQuality: 'excellent',
        joinedAt: new Date().toISOString()
      },
      {
        id: '2',
        userId: 'user2',
        name: 'Jane Smith',
        role: 'speaker',
        isAudioEnabled: true,
        isVideoEnabled: false,
        isHandRaised: false,
        connectionQuality: 'good',
        joinedAt: new Date().toISOString()
      },
      {
        id: '3',
        userId: 'user3',
        name: 'Mike Johnson',
        role: 'audience',
        isAudioEnabled: false,
        isVideoEnabled: false,
        isHandRaised: true,
        connectionQuality: 'fair',
        joinedAt: new Date().toISOString()
      }
    ];
    setParticipants(mockParticipants);
  }, []);

  const handleToggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
    toast.success(`Microphone ${!isAudioEnabled ? 'enabled' : 'disabled'}`);
  }, [isAudioEnabled]);

  const handleToggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => !prev);
    toast.success(`Camera ${!isVideoEnabled ? 'enabled' : 'disabled'}`);
  }, [isVideoEnabled]);

  const handleRaiseHand = useCallback(() => {
    setIsHandRaised(prev => !prev);
    toast.success(`Hand ${!isHandRaised ? 'raised' : 'lowered'}`);
  }, [isHandRaised]);

  const handleScreenShare = useCallback(() => {
    toast.info('Screen sharing started');
  }, []);

  const handlePromoteToSpeaker = useCallback((participantId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, role: 'speaker' as const }
          : p
      )
    );
    toast.success('Participant promoted to speaker');
  }, []);

  const handleMuteParticipant = useCallback((participantId: string) => {
    setParticipants(prev => 
      prev.map(p => 
        p.id === participantId 
          ? { ...p, isAudioEnabled: false }
          : p
      )
    );
    toast.success('Participant muted');
  }, []);

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'moderator': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'speaker': return <Mic className="h-4 w-4 text-blue-500" />;
      default: return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  if (connectionState === 'connecting') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
            <h3 className="text-xl font-semibold mb-2">Connecting to Stage...</h3>
            <p className="text-white/60">Setting up audio and video connections</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="text-white">
            <h2 className="text-xl font-semibold">Live Stage</h2>
            <p className="text-white/60 text-sm">
              {participants.length} participants • Connection: {connectionQuality}
            </p>
          </div>
          <Badge 
            className={`${getConnectionQualityColor(connectionQuality)} bg-white/10 border-white/20`}
          >
            {connectionQuality.toUpperCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onLeave}
          >
            <Phone className="h-4 w-4 mr-2" />
            Leave
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Stage Area */}
        <div className="flex-1 p-4">
          {/* Speakers Section */}
          <Card className="mb-4 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Speakers ({participants.filter(p => p.role === 'speaker' || p.role === 'moderator').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {participants
                  .filter(p => p.role === 'speaker' || p.role === 'moderator')
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="relative bg-black/30 rounded-lg p-4 aspect-video flex items-center justify-center border border-white/20"
                    >
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        {getRoleIcon(participant.role)}
                        {!participant.isAudioEnabled && (
                          <MicOff className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                      
                      {participant.isVideoEnabled ? (
                        <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
                          <span className="text-white/60">Video Feed</span>
                        </div>
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute bottom-2 left-2 right-2">
                        <div className="bg-black/60 rounded px-2 py-1">
                          <p className="text-white text-xs font-medium truncate">
                            {participant.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Audience Section */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Audience ({participants.filter(p => p.role === 'audience').length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {participants
                  .filter(p => p.role === 'audience')
                  .map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between p-2 bg-black/20 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {participant.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-white text-sm">{participant.name}</span>
                        {participant.isHandRaised && (
                          <Hand className="h-4 w-4 text-yellow-400" />
                        )}
                      </div>
                      
                      {userRole === 'moderator' && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePromoteToSpeaker(participant.id)}
                            className="h-6 px-2 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            Promote
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMuteParticipant(participant.id)}
                            className="h-6 px-2 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <VolumeX className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Sidebar */}
        {isChatOpen && (
          <div className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/20 p-4">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Stage Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
              
              <div className="flex-1 bg-black/20 rounded-lg p-3 mb-4">
                <p className="text-white/60 text-sm text-center">
                  Chat messages will appear here
                </p>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60 text-sm"
                />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="p-4 bg-black/30 backdrop-blur-sm border-t border-white/20">
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={handleToggleAudio}
            className="w-12 h-12 rounded-full"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isVideoEnabled ? "default" : "secondary"}
            size="lg"
            onClick={handleToggleVideo}
            className="w-12 h-12 rounded-full"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          {userRole === 'audience' && (
            <Button
              variant={isHandRaised ? "default" : "secondary"}
              size="lg"
              onClick={handleRaiseHand}
              className="w-12 h-12 rounded-full"
            >
              <Hand className="h-5 w-5" />
            </Button>
          )}
          
          {(userRole === 'speaker' || userRole === 'moderator') && (
            <Button
              variant="secondary"
              size="lg"
              onClick={handleScreenShare}
              className="w-12 h-12 rounded-full"
            >
              <Monitor className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="secondary"
            size="lg"
            className="w-12 h-12 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedStageRoom;
