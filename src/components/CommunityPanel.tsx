
import React from 'react';
import EnhancedCommunityPanel from './community/EnhancedCommunityPanel';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ channelName = 'general' }) => {
  return (
    <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20">
      <EnhancedCommunityPanel defaultChannel={channelName} />
    </div>
  );
};

export default CommunityPanel;
