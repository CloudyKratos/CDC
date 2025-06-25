
import React from 'react';
import StageWorkInProgress from '../stage-call/StageWorkInProgress';

interface RealTimeStageCallProps {
  stageId: string;
  onLeave: () => void;
}

const RealTimeStageCall: React.FC<RealTimeStageCallProps> = ({
  stageId,
  onLeave
}) => {
  return <StageWorkInProgress />;
};

export default RealTimeStageCall;
