
import React from 'react';
import CommandRoomTabs from './command-room/CommandRoomTabs';
import CommandRoomQuickActions from './command-room/CommandRoomQuickActions';
import { useAuth } from '@/contexts/AuthContext';

const CommandRoomPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6">
      <CommandRoomQuickActions />
      <CommandRoomTabs isAdmin={isAdmin} />
    </div>
  );
};

export default CommandRoomPanel;
