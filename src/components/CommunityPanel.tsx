
import React from 'react';
import CommunityPanel from './community/CommunityPanel';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanelWrapper: React.FC<CommunityPanelProps> = ({ channelName = 'general' }) => {
  return <CommunityPanel defaultChannel={channelName} />;
};

export default CommunityPanelWrapper;
