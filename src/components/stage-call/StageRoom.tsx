
import React, { useState, useEffect } from 'react';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { useStageInitialization } from './hooks/useStageInitialization';
import { useStageActions } from './hooks/useStageActions';
import { useStageEventHandlers } from './hooks/useStageEventHandlers';
import { ConnectionError } from './ui/ConnectionError';
import { StageLoadingScreen } from './ui/StageLoadingScreen';
import { StageRoomContent } from './ui/StageRoomContent';
import { StageChat } from './ui/StageChat';
import { toast } from 'sonner';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const [userRole] = useState<'speaker' | 'audience'>('audience');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const { state, isJoining, localStream, remoteStreams, handleLeave } = useStageInitialization({
    stageId,
    onLeave
  });
  
  const { participants, chatMessages } = useStageEventHandlers();
  
  const {
    handleToggleAudio,
    handleToggleVideo,
    handleRaiseHand,
    handleStartScreenShare,
    handleSendChatMessage,
    handleEndStage,
    handleDeviceSwitch
  } = useStageActions();

  const { initializeStage } = useStageOrchestrator();

  // Monitor connection state and handle automatic reconnection
  useEffect(() => {
    if (state.connectionState === 'error' && state.errors.length > 0) {
      const currentError = state.errors.join(', ');
      setLastError(currentError);
      
      // Auto-retry for certain types of errors
      if (currentError.includes('Circuit breaker') && reconnectAttempts < 2) {
        const retryDelay = (reconnectAttempts + 1) * 3000;
        
        toast.info(`Connection lost. Retrying in ${retryDelay / 1000} seconds...`, {
          duration: retryDelay
        });
        
        setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          handleRetryConnection();
        }, retryDelay);
      }
    }
  }, [state.connectionState, state.errors, reconnectAttempts]);

  // Reset reconnect attempts on successful connection
  useEffect(() => {
    if (state.connectionState === 'connected') {
      setReconnectAttempts(0);
      setLastError(null);
    }
  }, [state.connectionState]);

  const convertToMediaDeviceInfo = (devices: any[]): MediaDeviceInfo[] => {
    return devices.map(device => ({
      deviceId: device.deviceId,
      label: device.label,
      kind: device.kind,
      groupId: device.groupId || '',
      toJSON: () => ({
        deviceId: device.deviceId,
        label: device.label,
        kind: device.kind,
        groupId: device.groupId || ''
      })
    }));
  };

  const handleRetryConnection = async () => {
    try {
      await initializeStage({
        stageId,
        userId: '',
        userRole: 'audience',
        enableSecurity: true,
        enableCompliance: true
      });
    } catch (error) {
      console.error('Retry connection failed:', error);
    }
  };

  const handleForceReconnect = async () => {
    setReconnectAttempts(0);
    setLastError(null);
    
    toast.info('Force reconnecting...', {
      description: 'Cleaning up previous session and establishing new connection',
      duration: 3000
    });
    
    await handleRetryConnection();
  };

  // Loading state with enhanced feedback
  if (state.connectionState === 'connecting' || isJoining) {
    return (
      <StageLoadingScreen 
        onLeave={onLeave}
        message={isJoining ? 'Joining stage...' : 'Connecting...'}
        showProgress={true}
      />
    );
  }

  // Error state with enhanced recovery options
  if (state.connectionState === 'error') {
    return (
      <ConnectionError
        error={lastError || state.errors.join(', ') || 'Connection failed'}
        onRetry={handleForceReconnect}
        onLeave={onLeave}
        retryAttempts={reconnectAttempts}
        maxRetries={3}
      />
    );
  }

  // Reconnecting state
  if (state.connectionState === 'reconnecting') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
            <h3 className="text-xl font-semibold mb-2">Reconnecting...</h3>
            <p className="text-white/60">Attempting to restore connection</p>
            <p className="text-white/40 text-sm mt-2">Attempt {reconnectAttempts + 1} of 3</p>
          </div>
        </div>
      </div>
    );
  }

  // Connected state with enhanced features
  return (
    <>
      <StageRoomContent
        state={state}
        participants={participants}
        userRole={userRole}
        onLeave={handleLeave}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onEndStage={userRole === 'speaker' ? () => handleEndStage().then(handleLeave) : undefined}
        onRaiseHand={userRole === 'audience' ? handleRaiseHand : undefined}
        onStartScreenShare={userRole === 'speaker' ? handleStartScreenShare : undefined}
        convertToMediaDeviceInfo={convertToMediaDeviceInfo}
        switchAudioDevice={(deviceId) => handleDeviceSwitch(deviceId, 'audio')}
        switchVideoDevice={(deviceId) => handleDeviceSwitch(deviceId, 'video')}
        localStream={localStream}
        remoteStreams={remoteStreams}
        connectionQuality={state.networkQuality?.quality || 'fair'}
        participantCount={participants.length + 1}
      />
      
      <StageChat
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        participantCount={participants.length + 1}
        connectionState={state.connectionState}
      />
    </>
  );
};

export default StageRoom;
