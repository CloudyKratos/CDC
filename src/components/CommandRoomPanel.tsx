
import React from 'react';
import CommandRoomTabs from './command-room/CommandRoomTabs';
import MobileCommandCenter from './mobile/MobileCommandCenter';
import { useRole } from '@/contexts/RoleContext';
import { useIsMobile } from '@/hooks/use-mobile';

const CommandRoomPanel: React.FC = () => {
  const { currentRole, canManageCalendar } = useRole();
  const isAdmin = currentRole === 'admin' || canManageCalendar;
  const isMobile = useIsMobile();

  // On mobile, render the mobile-optimized command center
  if (isMobile) {
    return <MobileCommandCenter isAdmin={isAdmin} />;
  }

  // On desktop, render the desktop tabs version
  return (
    <div className="h-full">
      <CommandRoomTabs isAdmin={isAdmin} />
    </div>
  );
};

export default CommandRoomPanel;
