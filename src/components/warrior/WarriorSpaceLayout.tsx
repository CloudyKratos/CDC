
import React from "react";
import WarriorSpaceHeader from "./WarriorSpaceHeader";
import WarriorSpaceBackground from "./WarriorSpaceBackground";
import WarriorProgressIndicator from "./WarriorProgressIndicator";

interface WarriorSpaceLayoutProps {
  progress: any;
  children: React.ReactNode;
}

const WarriorSpaceLayout = ({ progress, children }: WarriorSpaceLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <WarriorSpaceBackground />
      
      <div className="relative z-10">
        <WarriorSpaceHeader progress={progress} />
        {children}
      </div>

      <WarriorProgressIndicator />
    </div>
  );
};

export default WarriorSpaceLayout;
