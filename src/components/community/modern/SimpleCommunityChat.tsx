
import React from 'react';
import { RobustCommunityChat } from './RobustCommunityChat';

interface SimpleCommunityChатProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityChat: React.FC<SimpleCommunityChатProps> = ({
  channelName = 'general',
  className = ''
}) => {
  return (
    <RobustCommunityChat 
      channelName={channelName}
      className={className}
    />
  );
};
