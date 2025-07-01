
import React from 'react';
import StableCommunityPanel from './StableCommunityPanel';

interface CommunityChatProps {
  defaultChannel?: string;
}

const CommunityChat: React.FC<CommunityChatProps> = ({ defaultChannel = 'general' }) => {
  return <StableCommunityPanel defaultChannel={defaultChannel} />;
};

export default CommunityChat;
