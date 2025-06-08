
import React from 'react';
import EnhancedCommandRoom from './command-room/EnhancedCommandRoom';
import CommandRoomQuickActions from './command-room/CommandRoomQuickActions';

const CommandRoomPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <CommandRoomQuickActions />
      <EnhancedCommandRoom />
    </div>
  );
};

export default CommandRoomPanel;
