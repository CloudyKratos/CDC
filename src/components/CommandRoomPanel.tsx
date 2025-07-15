
import React from 'react';
import CommandRoomTabs from './command-room/CommandRoomTabs';
import { useRole } from '@/contexts/RoleContext';

const CommandRoomPanel: React.FC = () => {
  const { currentRole, canManageCalendar } = useRole();
  const isAdmin = currentRole === 'admin' || canManageCalendar;

  return (
    <div className="h-full">
      <CommandRoomTabs isAdmin={isAdmin} />
    </div>
  );
};

export default CommandRoomPanel;
