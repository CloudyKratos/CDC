
import React from 'react';
import CommandRoomTabs from './command-room/CommandRoomTabs';
import { useAuth } from '@/contexts/auth/AuthContext';

const CommandRoomPanel: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="h-full">
      <CommandRoomTabs isAdmin={isAdmin} />
    </div>
  );
};

export default CommandRoomPanel;
