
import React, { useState } from "react";
import { 
  Home, 
  MessageSquare, 
  CalendarDays, 
  FileText, 
  Users, 
  Settings, 
  Menu, 
  X,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/Logo";

interface SidebarProps {
  onSelectItem: (item: string) => void;
  activeItem: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectItem, activeItem }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "community", label: "Community", icon: Users },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "h-screen bg-white border-r border-gray-100 transition-all duration-300 ease-in-out z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-6 border-b border-gray-100">
        {!collapsed && <Logo size="sm" />}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className="text-gray-500 hover:text-primary"
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1 transition-all",
                activeItem === item.id 
                  ? "bg-secondary text-primary font-medium" 
                  : "text-gray-600 hover:text-primary hover:bg-gray-50",
                collapsed ? "justify-center px-2" : "justify-start px-3"
              )}
              onClick={() => onSelectItem(item.id)}
            >
              <item.icon size={20} className={collapsed ? "mx-auto" : "mr-2"} />
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-center border-dashed border-gray-300 text-gray-600 hover:text-primary hover:border-primary",
            "transition-all duration-200"
          )}
        >
          <PlusCircle size={20} className={collapsed ? "" : "mr-2"} />
          {!collapsed && <span>New Workspace</span>}
        </Button>
      </div>
    </div>
  );
};
