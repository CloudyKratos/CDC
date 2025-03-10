
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom"; 
import { cn } from "@/lib/utils";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/App";
import { useToast } from "@/hooks/use-toast";

export interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  isMobile, 
  isOpen, 
  setIsOpen 
}: SidebarProps) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged out successfully!",
      description: "Redirecting to login page...",
    });
  };
  
  // Check if user is an admin
  const isAdmin = user && user.role === 'Admin';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-gray-950 border-r border-gray-800 text-gray-300 w-64",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isMobile ? "fixed top-0 left-0 z-40" : "relative",
        "transition-transform duration-300 ease-in-out"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-lg font-bold">Nexus</span>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      
      {/* User Info */}
      {user && (
        <div className="px-4 py-2 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <img
              src={user.avatar}
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-400">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    
    <div className="flex-1 py-2">
      <nav className="px-2 space-y-1">
        {/* Dashboard */}
        <a
          href="/dashboard"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "dashboard"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("dashboard")}
        >
          <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Dashboard
        </a>
        
        {/* Users */}
        <a
          href="#"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "users"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("users")}
        >
          <Users className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Users
        </a>
        
        {/* Calendar */}
        <a
          href="#"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "calendar"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("calendar")}
        >
          <Calendar className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Calendar
        </a>
        
        {/* Messages */}
        <a
          href="#"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "messages"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("messages")}
        >
          <MessageSquare className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Messages
        </a>
        
        {/* Settings */}
        <a
          href="#"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "settings"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("settings")}
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Settings
        </a>
        
        {/* Notifications */}
        <a
          href="#"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md group",
            activeSection === "notifications"
              ? "bg-gray-800 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          )}
          onClick={() => setActiveSection("notifications")}
        >
          <Bell className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
          Notifications
        </a>
        
        {/* Add Admin link for admin users */}
        {isAdmin && (
          <a
            href="/beta-admin"
            className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-800 hover:text-white group"
          >
            <ShieldCheck className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            Beta Admin
          </a>
        )}
      </nav>
    </div>
    
      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="outline"
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
