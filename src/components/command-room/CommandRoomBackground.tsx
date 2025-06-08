
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-200/40 to-pink-200/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-32 right-32 w-64 h-64 bg-gradient-to-br from-blue-200/40 to-cyan-200/40 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl"></div>
    </div>
  );
};

export default CommandRoomBackground;
