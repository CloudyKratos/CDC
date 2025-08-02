
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoConference } from './hooks/useVideoConference';
import ParticipantVideo from './ParticipantVideo';
import ProfessionalStageControls from './ui/ProfessionalStageControls';
import { 
  Loader2, 
  Users, 
  Wifi, 
  WifiOff, 
  Settings, 
  Monitor,
  Signal,
  Clock,
  Video as VideoIcon,
  Mic,
  Zap,
  AlertCircle
} from 'lucide-react';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [showStats, setShowStats] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'failed'>('connecting');

  const {
    isConnected,
    isConnecting,
    participants,
    localParticipant,
    localStream,
    isAudioEnabled,
    isVideoEnabled,
    isHandRaised,
    isScreenSharing,
    conferenceStats,
    joinConference,
    leaveConference,
    toggleAudio,
    toggleVideo,
    toggleHandRaise,
    startScreenShare,
    stopScreenShare
  } = useVideoConference();

  // Auto-join on mount with retry logic
  useEffect(() => {
    if (user && !isConnected && !isConnecting) {
      setConnectionStatus('connecting');
      joinConference(stageId).then(success => {
        setConnectionStatus(success ? 'connected' : 'failed');
        if (!success) {
          // Retry after 3 seconds
          setTimeout(() => {
            if (!isConnected) {
              setConnectionStatus('reconnecting');
              joinConference(stageId);
            }
          }, 3000);
        }
      });
    }
  }, [user, stageId, isConnected, isConnecting, joinConference]);

  // Update connection status based on conference state
  useEffect(() => {
    if (isConnected) {
      setConnectionStatus('connected');
    } else if (isConnecting) {
      setConnectionStatus('connecting');
    }
  }, [isConnected, isConnecting]);

  const handleLeave = useCallback(async () => {
    try {
      await leaveConference();
      onLeave();
    } catch (error) {
      console.error('Error leaving conference:', error);
      onLeave(); // Still leave even if cleanup fails
    }
  }, [leaveConference, onLeave]);

  const handleScreenShare = useCallback(async () => {
    try {
      if (isScreenSharing) {
        await stopScreenShare();
      } else {
        await startScreenShare();
      }
    } catch (error) {
      console.error('Screen share error:', error);
    }
  }, [isScreenSharing, stopScreenShare, startScreenShare]);

  const handleToggleChat = useCallback(() => {
    setShowChat(!showChat);
  }, [showChat]);

  const handleSettings = useCallback(() => {
    console.log('Settings clicked');
    // TODO: Implement settings modal
  }, []);

  const getGridCols = useCallback((count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-2xl mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto';
    if (count <= 4) return 'grid-cols-2 lg:grid-cols-2 gap-4 max-w-4xl mx-auto';
    if (count <= 6) return 'grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto';
    if (count <= 9) return 'grid-cols-3 lg:grid-cols-3 gap-3 max-w-6xl mx-auto';
    return 'grid-cols-3 lg:grid-cols-4 gap-3';
  }, []);

  const getActiveSpeaker = useCallback(() => {
    return participants.find(p => p.isSpeaking) || participants[0] || null;
  }, [participants]);

  // Auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">Please log in to join the video conference</p>
            <Button onClick={onLeave}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connecting/Loading state
  if (isConnecting || connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="w-96 animate-fade-in bg-gray-900/80 backdrop-blur-xl border-gray-700">
          <CardContent className="text-center p-8">
            <div className="relative mb-6">
              <Loader2 className="h-16 w-16 animate-spin mx-auto text-blue-500" />
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
            </div>
            
            <h3 className="text-xl font-semibold mb-2 text-white">
              {connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Joining Video Conference'}
            </h3>
            
            <p className="text-gray-300 mb-6">
              {connectionStatus === 'reconnecting' 
                ? 'Attempting to restore connection...' 
                : 'Setting up your professional video call experience...'
              }
            </p>
            
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center justify-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200" />
                </div>
                <span>Initializing high-quality media streams</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Mic className="w-4 h-4 text-green-400" />
                <span>Testing microphone and audio quality</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <VideoIcon className="w-4 h-4 text-blue-400" />
                <span>Optimizing video settings</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Establishing secure peer connections</span>
              </div>
            </div>
            
            {connectionStatus === 'reconnecting' && (
              <div className="mt-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Connection lost. Attempting to reconnect...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main conference view
  const activeSpeaker = getActiveSpeaker();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Professional Header */}
      <div className="flex items-center justify-between p-4 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <VideoIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-white">Professional Call</h1>
          </div>
          
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30">
            Room: {stageId.slice(0, 8).toUpperCase()}
          </Badge>
          
          {isScreenSharing && (
            <Badge className="bg-green-600/20 text-green-400 border-green-600/30 animate-pulse">
              <Monitor className="w-3 h-3 mr-1" />
              Screen Sharing Active
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-6">
          {/* Connection Quality */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' :
              connectionStatus === 'connecting' || connectionStatus === 'reconnecting' ? 'bg-yellow-400 animate-pulse' :
              'bg-red-400'
            }`} />
            <span className="text-sm text-white/80 capitalize">{connectionStatus}</span>
          </div>

          {/* Participant Count */}
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full">
            <Users className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white font-medium">{participants.length}</span>
          </div>

          {/* Conference Stats Toggle */}
          {conferenceStats && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Signal className="w-4 h-4" />
            </Button>
          )}

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSettings}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Panel */}
      {showStats && conferenceStats && (
        <div className="p-4 bg-black/30 backdrop-blur-sm border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium">{conferenceStats.participantCount} participants</span>
              </div>
              
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <VideoIcon className="w-4 h-4 text-green-400" />
                <span>Video: </span>
                <Badge variant="outline" className={`text-xs ${
                  conferenceStats.videoQuality === 'excellent' ? 'border-green-400 text-green-400' :
                  conferenceStats.videoQuality === 'good' ? 'border-blue-400 text-blue-400' :
                  conferenceStats.videoQuality === 'fair' ? 'border-yellow-400 text-yellow-400' :
                  'border-red-400 text-red-400'
                }`}>
                  {conferenceStats.videoQuality}
                </Badge>
              </div>
              
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <Mic className="w-4 h-4 text-green-400" />
                <span>Audio: </span>
                <Badge variant="outline" className={`text-xs ${
                  conferenceStats.audioQuality === 'excellent' ? 'border-green-400 text-green-400' :
                  conferenceStats.audioQuality === 'good' ? 'border-blue-400 text-blue-400' :
                  conferenceStats.audioQuality === 'fair' ? 'border-yellow-400 text-yellow-400' :
                  'border-red-400 text-red-400'
                }`}>
                  {conferenceStats.audioQuality}
                </Badge>
              </div>
              
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <Signal className="w-4 h-4 text-blue-400" />
                <span>{conferenceStats.networkLatency}ms latency</span>
              </div>
              
              <Separator orientation="vertical" className="h-4 bg-white/20" />
              
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>{conferenceStats.bandwidth} kbps</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(false)}
              className="text-white/50 hover:text-white"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Professional Video Grid */}
      <div className="flex-1 p-6 overflow-auto">
        {participants.length > 0 ? (
          <div className={`grid ${getGridCols(participants.length)} gap-4 h-full min-h-0`}>
            {participants.map((participant) => (
              <ParticipantVideo
                key={participant.id}
                participant={participant}
                isLocal={participant.id === user?.id}
                isActiveSpeaker={activeSpeaker?.id === participant.id}
                className="min-h-0 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <Card className="w-96 bg-gray-900/50 backdrop-blur-xl border-gray-700">
              <CardContent className="text-center p-8">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Waiting for participants</h3>
                <p className="text-gray-400 mb-6">
                  Share the room ID with others to start your professional video conference
                </p>
                <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                  <p className="text-sm text-blue-400 font-mono">
                    Room ID: {stageId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Professional Controls */}
      <ProfessionalStageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        userRole="speaker" // TODO: Get from user context/props
        participantCount={participants.length}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onRaiseHand={toggleHandRaise}
        onToggleChat={handleToggleChat}
        onScreenShare={handleScreenShare}
        onLeave={handleLeave}
        onSettings={handleSettings}
      />

      {/* Chat Panel Overlay */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-black/90 backdrop-blur-xl border-l border-white/10 z-50">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Chat</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChat(false)}
                className="text-white/70 hover:text-white"
              >
                ×
              </Button>
            </div>
          </div>
          <div className="p-4 text-center text-white/50">
            Chat feature coming soon...
          </div>
        </div>
      )}
    </div>
  );
};

export default StageRoom;
