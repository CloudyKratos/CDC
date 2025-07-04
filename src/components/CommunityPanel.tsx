
import React from 'react';
import SimpleCommunityPanel from './community/modern/SimpleCommunityPanel';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  channelName = 'general' 
}) => {
  return <SimpleCommunityPanel channelName={channelName} />;
};

export default CommunityPanel;
