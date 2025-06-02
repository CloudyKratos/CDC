
import React from 'react';
import DiscordCommunityPanel from './community/DiscordCommunityPanel';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ channelName = 'general' }) => {
  return (
    <div className="h-full">
      <DiscordCommunityPanel defaultChannel={channelName} />
    </div>
  );
};

export default CommunityPanel;
