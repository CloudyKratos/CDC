
import React from 'react';
import { Zap, TrendingUp } from 'lucide-react';

const CommandRoomHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Command Room</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Your centralized learning and development hub
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <TrendingUp className="w-4 h-4" />
        <span>Track progress • Discover resources • Achieve goals</span>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
