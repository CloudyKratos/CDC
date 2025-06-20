
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

interface WarriorSpaceMobileSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const WarriorSpaceMobileSidebar = ({ sidebarOpen, onToggleSidebar }: WarriorSpaceMobileSidebarProps) => {
  return (
    <div className="lg:hidden mb-6">
      <Button
        onClick={onToggleSidebar}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 shadow-lg"
      >
        {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        {sidebarOpen ? "Close Menu" : "Open Dashboard"}
      </Button>
    </div>
  );
};

export default WarriorSpaceMobileSidebar;
