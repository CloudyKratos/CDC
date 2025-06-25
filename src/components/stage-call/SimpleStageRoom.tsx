
import React from 'react';
import StageWorkInProgress from './StageWorkInProgress';

interface SimpleStageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const SimpleStageRoom: React.FC<SimpleStageRoomProps> = ({
  stageId,
  onLeave
}) => {
  return <StageWorkInProgress />;
};

export default SimpleStageRoom;
