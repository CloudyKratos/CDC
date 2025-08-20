import React from 'react';
import { SimpleChatContainer } from '../messaging/SimpleChatContainer';

interface MobileCommunityChatProps {
  defaultChannel?: string;
}

const MobileCommunityChat: React.FC<MobileCommunityChatProps> = () => {
  return <SimpleChatContainer />;
};

export default MobileCommunityChat;