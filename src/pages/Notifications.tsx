
import React from 'react';
import NotificationPanel from '@/components/notifications/NotificationPanel';

const Notifications: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <NotificationPanel />
      </div>
    </div>
  );
};

export default Notifications;
