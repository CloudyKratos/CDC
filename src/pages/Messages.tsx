
import React from 'react';
import DirectMessagesPanel from '@/components/messaging/DirectMessagesPanel';

const Messages: React.FC = () => {
  return (
    <div className="h-screen bg-gray-100 dark:bg-gray-950 p-4">
      <DirectMessagesPanel />
    </div>
  );
};

export default Messages;
