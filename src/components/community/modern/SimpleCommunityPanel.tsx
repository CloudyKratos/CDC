
import React from 'react';
import { EnhancedChatContainer } from '../EnhancedChatContainer';

interface SimpleCommunityPanelProps {
  channelName?: string;
  className?: string;
}

export const SimpleCommunityPanel: React.FC<SimpleCommunityPanelProps> = ({
  channelName = 'general',
  className = ''
}) => {
  return (
    <div className={`h-full ${className}`}>
      <EnhancedChatContainer defaultChannel={channelName} />
    </div>
  );
};

export default SimpleCommunityPanel;
