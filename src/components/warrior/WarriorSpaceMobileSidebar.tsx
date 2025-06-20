
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, LayoutDashboard } from "lucide-react";

interface WarriorSpaceMobileSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const WarriorSpaceMobileSidebar = ({ sidebarOpen, onToggleSidebar }: WarriorSpaceMobileSidebarProps) => {
  return (
    <div className="lg:hidden mb-6">
      <Button
        onClick={onToggleSidebar}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transition-all duration-300 py-4 rounded-xl border border-purple-500/30"
      >
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
      </Button>
    </div>
  );
};

export default WarriorSpaceMobileSidebar;
