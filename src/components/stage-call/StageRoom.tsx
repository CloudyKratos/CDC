
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStageMedia } from './hooks/useStageMedia';
import { useSocketStage } from './hooks/useSocketStage';
import { ParticipantGrid } from './ui/ParticipantGrid';
import { StageControls } from './ui/StageControls';
import { ConnectionError } from './ui/ConnectionError';
import { StageHeader } from './ui/StageHeader';
import { cleanupStageResources } from './utils/cleanup';
import { toast } from 'sonner';
import StageCleanupService from '@/services/StageCleanupService';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [participants, setParticipants] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<'speaker' | 'audience'>('audience');
  const cleanupService = StageCleanupService.getInstance();

  const {
    isAudioEnabled,
    isVideoEnabled,
    localStream,
    toggleAudio,
    toggleVideo,
    initializeMedia,
    cleanupMedia
  } = useStageMedia();

  const {
    socket,
    peerConnections,
    connect,
    disconnect,
    isConnected,
    connectionError,
    forceReconnect
  } = useSocketStage(stageId, user?.id || '');

  useEffect(() => {
    const initializeStage = async () => {
      try {
        setConnectionState('connecting');
        
        // Initialize media first
        await initializeMedia();
        
        // Connect to stage with cleanup
        await connect();
        
        setConnectionState('connected');
        toast.success('Connected to stage');
      } catch (error) {
        console.error('Failed to initialize stage:', error);
        setConnectionState('error');
        toast.error('Failed to connect to stage');
      }
    };

    if (user) {
      initializeStage();
    }

    return () => {
      handleLeave();
    };
  }, [stageId, user]);

  const handleLeave = async () => {
    try {
      setConnectionState('disconnected');
      await cleanupMedia();
      await disconnect();
      await cleanupStageResources(stageId, user?.id || '');
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave(); // Leave anyway
    }
  };

  const handleForceReconnect = async () => {
    try {
      setConnectionState('connecting');
      toast.info('Force reconnecting...');
      await forceReconnect();
      setConnectionState('connected');
      toast.success('Reconnected successfully');
    } catch (error) {
      console.error('Force reconnect failed:', error);
      setConnectionState('error');
      toast.error('Failed to reconnect');
    }
  };

  const handleEndStage = async () => {
    try {
      const success = await cleanupService.endStageAndCleanup(stageId);
      if (success) {
        toast.success('Stage ended successfully');
        onLeave();
      } else {
        toast.error('Failed to end stage');
      }
    } catch (error) {
      console.error('Error ending stage:', error);
      toast.error('Failed to end stage');
    }
  };

  if (connectionState === 'connecting') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <StageHeader
          status="connecting"
          participantCount={0}
          onLeave={onLeave}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-white text-lg">Connecting to stage...</p>
            <p className="text-white/70 text-sm">Setting up secure connection</p>
          </div>
        </div>
      </div>
    );
  }

  if (connectionState === 'error' || connectionError) {
    return (
      <ConnectionError
        error={connectionError || 'Connection failed'}
        onRetry={handleForceReconnect}
        onLeave={onLeave}
      />
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <StageHeader
        status={isConnected ? 'connected' : 'disconnected'}
        participantCount={participants.length}
        onLeave={handleLeave}
      />
      
      <ParticipantGrid
        participants={participants}
        localStream={localStream}
        userRole={userRole}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
      />
      
      <StageControls
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        userRole={userRole}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onLeave={handleLeave}
        onEndStage={handleEndStage}
      />
    </div>
  );
};
