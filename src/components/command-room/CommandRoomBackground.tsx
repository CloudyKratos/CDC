
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
    </div>
  );
};

export default CommandRoomBackground;
