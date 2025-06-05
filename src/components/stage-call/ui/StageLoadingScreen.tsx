
import React from 'react';
import { StageHeader } from './StageHeader';

interface StageLoadingScreenProps {
  onLeave: () => void;
}

export const StageLoadingScreen: React.FC<StageLoadingScreenProps> = ({ onLeave }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <StageHeader
        status="connecting"
        participantCount={0}
        onLeave={onLeave}
      />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
          <p className="text-white text-xl font-semibold">Connecting to stage...</p>
          <p className="text-white/70 text-sm">Setting up secure connection with enterprise-grade encryption</p>
          <div className="space-y-2 text-sm text-white/60">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Initializing media services</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Establishing WebRTC connections</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Optimizing network quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
