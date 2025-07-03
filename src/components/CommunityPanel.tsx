
import React from 'react';
import SimpleCommunityChat from './community/SimpleCommunityChat';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  channelName = 'general' 
}) => {
  return (
    <div className="h-full bg-gray-100 dark:bg-gray-950 p-4">
      <SimpleCommunityChat 
        channelName={channelName}
        className="mx-auto max-w-4xl"
      />
    </div>
  );
};

export default CommunityPanel;
