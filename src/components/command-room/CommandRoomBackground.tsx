
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Enhanced animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 via-transparent to-pink-900/40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.4),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,rgba(236,72,153,0.3),transparent_50%)]"></div>
      </div>
      
      {/* Enhanced animated particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                'rgba(56, 189, 248, 0.6)',
                'rgba(168, 85, 247, 0.6)',
                'rgba(236, 72, 153, 0.6)',
                'rgba(34, 197, 94, 0.6)',
                'rgba(251, 191, 36, 0.6)'
              ][Math.floor(Math.random() * 5)],
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
      
      {/* Enhanced grid overlay with CSS pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      ></div>
      
      {/* Floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-pink-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default CommandRoomBackground;
