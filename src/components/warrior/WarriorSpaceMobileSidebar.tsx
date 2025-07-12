
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard, ChevronRight, Sparkles } from "lucide-react";

interface WarriorSpaceMobileSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const WarriorSpaceMobileSidebar = ({ sidebarOpen, onToggleSidebar }: WarriorSpaceMobileSidebarProps) => {
  return (
    <div className="lg:hidden mb-6">
      <Button
        onClick={onToggleSidebar}
        className={`w-full ${
          sidebarOpen 
            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
        } text-white flex items-center justify-between gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 py-4 px-6 rounded-xl border ${
          sidebarOpen ? 'border-red-500/30' : 'border-purple-500/30'
        } relative overflow-hidden group`}
      >
        {/* Background glow effect */}
        <div className={`absolute inset-0 ${
          sidebarOpen 
            ? 'bg-gradient-to-r from-red-500/10 to-red-600/10' 
            : 'bg-gradient-to-r from-purple-500/10 to-blue-500/10'
        } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <div className="flex items-center gap-3 relative z-10">
          {sidebarOpen ? (
            <>
              <X className="h-5 w-5" />
              <span className="font-semibold">Close Dashboard</span>
            </>
          ) : (
            <>
              <LayoutDashboard className="h-5 w-5" />
              <span className="font-semibold">Open Dashboard</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {!sidebarOpen && (
            <>
              <Sparkles className="h-4 w-4 animate-pulse" />
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            </>
          )}
        </div>

        {/* Animated border effect */}
        <div className={`absolute inset-0 rounded-xl ${
          sidebarOpen 
            ? 'bg-gradient-to-r from-red-500 to-red-600' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500'
        } opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />
      </Button>

      {/* Helper text */}
      {!sidebarOpen && (
        <div className="text-center mt-3 animate-fade-in">
          <p className="text-purple-300 text-sm">
            <Sparkles className="h-3 w-3 inline mr-1" />
            Access stats, quick actions & power-ups
          </p>
        </div>
      )}
      
      {sidebarOpen && (
        <div className="text-center mt-3 animate-fade-in">
          <p className="text-red-300 text-sm">
            Tap outside or the close button to dismiss
          </p>
        </div>
      )}
    </div>
  );
};

export default WarriorSpaceMobileSidebar;
