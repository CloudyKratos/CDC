
import React from 'react';
import { ReliableCommunityChat } from '@/components/community/ReliableCommunityChat';

const CommunityPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 h-screen">
      <div className="h-full max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Community Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with the community in real-time discussions
          </p>
        </div>
        
        <div className="h-[calc(100vh-200px)]">
          <ReliableCommunityChat />
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
