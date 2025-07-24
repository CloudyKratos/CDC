
import React from 'react';
import { EnhancedChatContainer } from './community/EnhancedChatContainer';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  channelName = 'general' 
}) => {
  return <EnhancedChatContainer channelName={channelName} />;
};

export default CommunityPanel;
