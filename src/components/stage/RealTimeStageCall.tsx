
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
  Monitor,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import StageService from '@/services/StageService';
import { toast } from 'sonner';
import StageHeader from './components/StageHeader';
import ParticipantGrid from './components/ParticipantGrid';
import StageControls from './components/StageControls';

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
      
      let stageRole: 'speaker' | 'audience' | 'moderator' = 'audience';
      if (currentRole === 'admin') {
        stageRole = 'moderator';
      }
      setUserStageRole(stageRole);
      
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
      
      if (localStream) {
        localStream.getAudioTracks().forEach(track => {
          track.enabled = newState;
        });
      }
      
      setIsAudioEnabled(newState);
      
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
      <StageHeader 
        connectionStatus={connectionStatus}
        participantCount={participants.length}
        onLeave={onLeave}
        onEndCall={leaveCall}
      />

      <ParticipantGrid
        speakers={speakers}
        listeners={listeners}
        localVideoRef={localVideoRef}
        user={user}
        userStageRole={userStageRole}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        isHandRaised={isHandRaised}
        activeSpeaker={activeSpeaker}
        canModerate={canModerate}
      />

      <StageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        canSpeak={canSpeak}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleHandRaise={toggleHandRaise}
        onStartScreenShare={startScreenShare}
        onStopScreenShare={stopScreenShare}
        onLeaveCall={leaveCall}
      />
    </div>
  );
};

export default RealTimeStageCall;
