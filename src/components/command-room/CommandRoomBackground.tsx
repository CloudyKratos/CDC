
import React from 'react';

const CommandRoomBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Simplified multi-layered gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/40 via-transparent to-pink-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-900/30 via-transparent to-amber-900/30"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(56,189,248,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(168,85,247,0.2),transparent_60%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(236,72,153,0.2),transparent_55%)]"></div>
      </div>
      
      {/* Minimal floating particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: [
                'rgba(56, 189, 248, 0.6)',
                'rgba(168, 85, 247, 0.6)',
                'rgba(236, 72, 153, 0.6)',
                'rgba(34, 197, 94, 0.6)'
              ][Math.floor(Math.random() * 4)],
              filter: 'blur(0.5px)'
            }}
          />
        ))}
      </div>
      
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        ></div>
      </div>
      
      {/* Static floating orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-3/4 right-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-pink-500/5 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 right-1/3 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl"></div>
      </div>
    </div>
  );
};

export default CommandRoomBackground;
