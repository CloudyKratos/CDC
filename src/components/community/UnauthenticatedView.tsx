
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

const UnauthenticatedView: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Join the Conversation
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please log in to participate in community discussions and connect with fellow warriors.
        </p>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default UnauthenticatedView;
