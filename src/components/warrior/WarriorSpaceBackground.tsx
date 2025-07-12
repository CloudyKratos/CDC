
import React from "react";

const WarriorSpaceBackground = () => {
  return (
    <div className="absolute inset-0">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/60 to-blue-900/20 animate-pulse"></div>
      
      {/* Enhanced grid pattern */}
      <div className="absolute inset-0 opacity-[0.05]">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[size:50px_50px]"></div>
      </div>
      
      {/* Dynamic floating orbs with staggered animations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-70 transition-all duration-[3s]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse opacity-70 transition-all duration-[4s] delay-1000"></div>
      <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse opacity-50 transition-all duration-[5s] delay-2000"></div>
      <div className="absolute top-1/2 right-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse opacity-60 transition-all duration-[3.5s] delay-500"></div>
      
      {/* Enhanced animated particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              top: `${10 + (i * 12)}%`,
              left: `${5 + (i * 11)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + (i % 3)}s`
            }}
          />
        ))}
      </div>
      
      {/* Subtle moving gradient lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-1000"></div>
      </div>
    </div>
  );
};

export default WarriorSpaceBackground;
