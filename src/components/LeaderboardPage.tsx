
import React from 'react';
import LeaderboardPanel from './community/LeaderboardPanel';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <LeaderboardPanel />
    </div>
  );
};

export default LeaderboardPage;
