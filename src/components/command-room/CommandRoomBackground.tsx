
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" className="text-slate-900 dark:text-slate-100" />
        </svg>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-xl"></div>
      <div className="absolute bottom-32 right-32 w-40 h-40 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-xl"></div>
    </div>
  );
};

export default CommandRoomBackground;
