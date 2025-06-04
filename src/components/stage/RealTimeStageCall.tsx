
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageService from '@/services/StageService';
import StageHeader from './components/StageHeader';
import EnhancedParticipantGrid from './components/EnhancedParticipantGrid';
import EnhancedStageControls from './components/EnhancedStageControls';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import '@/styles/stage-effects.css';

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
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking?: boolean;
  audioLevel?: number;
  avatarUrl?: string;
}

const RealTimeStageCall: React.FC<RealTimeStageCallProps> = ({
  stageId,
  onLeave
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [userStageRole, setUserStageRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [layoutMode, setLayoutMode] = useState<'grid' | 'spotlight' | 'circle'>('grid');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    initializeCall();
    
    return () => {
      // Cleanup when component unmounts
      handleLeaveCall();
    };
  }, [stageId]);

  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Join the stage through StageService
      const joinSuccess = await StageService.joinStage(stageId, 'audience');
      
      if (joinSuccess) {
        setConnectionStatus('connected');
        loadParticipants();
        setupRealtimeSubscriptions();
        toast.success('Joined stage successfully!');
      } else {
        setConnectionStatus('disconnected');
        toast.error('Failed to join stage');
      }
    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionStatus('disconnected');
      toast.error('Failed to connect to stage');
    }
  };

  const loadParticipants = async () => {
    try {
      const participantData = await StageService.getStageParticipants(stageId);
      
      const formattedParticipants: Participant[] = participantData.map(p => ({
        id: p.user_id,
        name: p.profiles?.full_name || p.profiles?.username || 'Anonymous',
        role: p.role,
        isAudioEnabled: !p.is_muted,
        isVideoEnabled: false, // Will be updated by WebRTC
        isMuted: p.is_muted,
        isHandRaised: p.is_hand_raised,
        isSpeaking: false,
        audioLevel: 0,
        avatarUrl: p.profiles?.avatar_url
      }));
      
      setParticipants(formattedParticipants);
      
      // Determine current user's role
      const currentUserParticipant = participantData.find(p => p.user_id === user?.id);
      if (currentUserParticipant) {
        setUserStageRole(currentUserParticipant.role);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  };

  const setupRealtimeSubscriptions = () => {
    // Subscribe to participant changes
    const participantChannel = StageService.subscribeToParticipants(stageId, () => {
      loadParticipants();
    });

    // Subscribe to stage updates
    const stageChannel = StageService.subscribeToStageUpdates(stageId, () => {
      // Handle stage status changes
    });

    return () => {
      participantChannel.unsubscribe();
      stageChannel.unsubscribe();
    };
  };

  const handleToggleAudio = async () => {
    const newAudioState = !isAudioEnabled;
    setIsAudioEnabled(newAudioState);
    
    // Update in database
    if (user) {
      await StageService.toggleMute(stageId, user.id, !newAudioState);
    }
    
    toast.success(newAudioState ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.success(isVideoEnabled ? 'Camera off' : 'Camera on');
  };

  const handleToggleHandRaise = async () => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    
    // Update in database
    await StageService.raiseHand(stageId, newHandState);
    
    toast.success(newHandState ? 'Hand raised' : 'Hand lowered');
  };

  const handleStartScreenShare = () => {
    setIsScreenSharing(true);
    toast.success('Screen sharing started');
  };

  const handleStopScreenShare = () => {
    setIsScreenSharing(false);
    toast.success('Screen sharing stopped');
  };

  const handleLayoutChange = (mode: 'grid' | 'spotlight' | 'circle') => {
    setLayoutMode(mode);
    toast.success(`Switched to ${mode} view`);
  };

  const handleLeaveCall = async () => {
    try {
      await StageService.leaveStage(stageId);
    } catch (error) {
      console.error('Error leaving stage:', error);
    }
  };

  const speakers = participants.filter(p => ['speaker', 'moderator'].includes(p.role));
  const listeners = participants.filter(p => p.role === 'audience');
  const canSpeak = ['speaker', 'moderator'].includes(userStageRole);
  const canModerate = userStageRole === 'moderator';

  return (
    <div className={cn(
      "flex flex-col h-full relative overflow-hidden",
      "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800"
    )}>
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg opacity-20" />
      
      {/* Stage Header */}
      <StageHeader
        connectionStatus={connectionStatus}
        participantCount={participants.length + 1}
        onLeave={onLeave}
        onEndCall={onLeave}
      />

      {/* Main Stage Area */}
      <EnhancedParticipantGrid
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
        layoutMode={layoutMode}
      />

      {/* Enhanced Controls */}
      <EnhancedStageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        isHandRaised={isHandRaised}
        isScreenSharing={isScreenSharing}
        canSpeak={canSpeak}
        layoutMode={layoutMode}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onToggleHandRaise={handleToggleHandRaise}
        onStartScreenShare={handleStartScreenShare}
        onStopScreenShare={handleStopScreenShare}
        onLeaveCall={onLeave}
        onLayoutChange={handleLayoutChange}
      />
    </div>
  );
};

export default RealTimeStageCall;
