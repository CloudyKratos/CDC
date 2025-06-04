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
    // Initialize stage call
    initializeCall();
    
    return () => {
      // Cleanup
    };
  }, [stageId]);

  const initializeCall = async () => {
    try {
      setConnectionStatus('connecting');
      // Simulate connection
      setTimeout(() => {
        setConnectionStatus('connected');
        // Mock participants for demo
        setParticipants([
          {
            id: '1',
            name: 'Alice Johnson',
            role: 'moderator',
            isAudioEnabled: true,
            isVideoEnabled: true,
            isMuted: false,
            isHandRaised: false,
            isSpeaking: true,
            audioLevel: 0.8,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
          },
          {
            id: '2',
            name: 'Bob Smith',
            role: 'speaker',
            isAudioEnabled: true,
            isVideoEnabled: false,
            isMuted: false,
            isHandRaised: false,
            audioLevel: 0.3,
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
          }
        ]);
        setActiveSpeaker('1');
      }, 1500);
    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionStatus('disconnected');
    }
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast.success(isAudioEnabled ? 'Microphone muted' : 'Microphone unmuted');
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.success(isVideoEnabled ? 'Camera off' : 'Camera on');
  };

  const handleToggleHandRaise = () => {
    setIsHandRaised(!isHandRaised);
    toast.success(isHandRaised ? 'Hand lowered' : 'Hand raised');
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
