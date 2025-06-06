
import React from 'react';
import { StageHeader } from './StageHeader';

interface StageLoadingScreenProps {
  onLeave: () => void;
}

export const StageLoadingScreen: React.FC<StageLoadingScreenProps> = ({ onLeave }) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative">
      {/* Animated background for loading */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-pink-500 rounded-full blur-xl animate-pulse delay-1000"></div>
      </div>

      <StageHeader
        status="connecting"
        participantCount={0}
        onLeave={onLeave}
      />
      
      <div className="flex-1 flex items-center justify-center relative">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          {/* Enhanced loading spinner */}
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-blue-400 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-white text-2xl font-bold">Joining Stage</h2>
            <p className="text-white/80 text-base">Setting up your secure connection...</p>
          </div>
          
          {/* Enhanced loading steps */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>🎤 Checking microphone access</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-300"></div>
              <span>📹 Configuring video stream</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-500"></div>
              <span>🔐 Establishing secure connection</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-white/70">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-700"></div>
              <span>⚡ Optimizing audio quality</span>
            </div>
          </div>
          
          {/* Connection tips */}
          <div className="mt-8 p-4 bg-black/20 rounded-lg border border-white/10">
            <p className="text-white/60 text-xs">
              💡 <strong>Tip:</strong> Make sure your browser allows microphone and camera access for the best experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
