
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Multi-layered animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/60 via-transparent to-pink-900/60"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/40 via-transparent to-amber-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.4),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.3),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(236,72,153,0.3),transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.25),transparent_65%)]"></div>
      </div>
      
      {/* Enhanced floating particles with varied sizes and colors */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                'rgba(56, 189, 248, 0.8)',
                'rgba(168, 85, 247, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(34, 197, 94, 0.8)',
                'rgba(251, 191, 36, 0.8)',
                'rgba(239, 68, 68, 0.7)',
                'rgba(16, 185, 129, 0.7)'
              ][Math.floor(Math.random() * 7)],
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 4}s`,
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>
      
      {/* Enhanced grid overlay with multiple layers */}
      <div className="absolute inset-0 opacity-15">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>
      
      {/* Enhanced floating orbs with better animations */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-cyan-500/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-36 h-36 bg-emerald-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 right-1/5 w-28 h-28 bg-amber-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Subtle moving lines for depth */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-2/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
    </div>
  );
};

export default CommandRoomBackground;
