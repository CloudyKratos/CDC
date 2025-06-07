
import React from 'react';
import { SimpleStageControls } from './SimpleStageControls';

interface StageControlsProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  userRole: 'speaker' | 'audience' | 'moderator';
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onRaiseHand: () => void;
  onToggleChat: () => void;
  onLeave: () => void;
}

export const StageControls: React.FC<StageControlsProps> = (props) => {
  return <SimpleStageControls {...props} />;
};

export default StageControls;
