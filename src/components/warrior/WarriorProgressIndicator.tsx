
import React from "react";
import { Zap } from "lucide-react";

const WarriorProgressIndicator = () => {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
        <Zap className="h-3 w-3 inline mr-1" />
        Auto-saving progress
      </div>
    </div>
  );
};

export default WarriorProgressIndicator;
