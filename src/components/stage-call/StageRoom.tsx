
import React, { useState } from 'react';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { useStageInitialization } from './hooks/useStageInitialization';
import { useStageActions } from './hooks/useStageActions';
import { useStageEventHandlers } from './hooks/useStageEventHandlers';
import { ConnectionError } from './ui/ConnectionError';
import { StageLoadingScreen } from './ui/StageLoadingScreen';
import { StageRoomContent } from './ui/StageRoomContent';
import { StageChat } from './ui/StageChat';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const [userRole] = useState<'speaker' | 'audience'>('audience');
  const [isChatOpen, setIsChatOpen] = useState(false);
  
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

  // Loading state
  if (state.connectionState === 'connecting' || isJoining) {
    return <StageLoadingScreen onLeave={onLeave} />;
  }

  // Error state
  if (state.connectionState === 'error') {
    return (
      <ConnectionError
        error={state.errors.join(', ') || 'Connection failed'}
        onRetry={() => initializeStage({
          stageId,
          userId: '',
          userRole: 'audience'
        })}
        onLeave={onLeave}
      />
    );
  }

  // Connected state
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
      />
      
      <StageChat
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        participantCount={participants.length + 1}
      />
    </>
  );
};
