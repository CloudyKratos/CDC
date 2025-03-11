
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Sun, 
  Moon, 
  BellRing, 
  MessageCircle, 
  FileText, 
  Users, 
  Settings, 
  X, 
  Calendar, 
  Home as HomeIcon 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface MobileMenuProps {
  unreadCount: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setViewMode: (mode: string) => void;
  handleNotificationClick: () => void;
  user: any;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ 
  unreadCount, 
  darkMode, 
  toggleDarkMode, 
  setViewMode, 
  handleNotificationClick,
  user
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    toast.success("Successfully logged out");
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Nexus Community</h1>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={toggleDarkMode}
          className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
      
      <div className="flex flex-col space-y-4 mb-6">
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => setViewMode("home")}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
            <HomeIcon size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Home</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Dashboard overview</p>
          </div>
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => setViewMode("chat")}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
            <MessageCircle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Direct Messages</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Chat with others</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white animate-pulse-glow">{unreadCount}</Badge>
          )}
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => {
            setViewMode("community");
          }}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Community</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Connect with the community</p>
          </div>
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => setViewMode("workspace")}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
            <FileText size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Documents</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your files</p>
          </div>
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => setViewMode("calendar")}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white">
            <Calendar size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Calendar</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">View upcoming events</p>
          </div>
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={() => setViewMode("profile")}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white">
            <Avatar>
              <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
              <AvatarFallback>{user?.name?.substring(0, 2) || "DP"}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your account details</p>
          </div>
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
          onClick={handleNotificationClick}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
            <BellRing size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white animate-pulse-glow">{unreadCount}</Badge>
          )}
        </button>
        
        <button 
          className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white">
            <Settings size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Settings</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Customize your experience</p>
          </div>
        </button>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between p-4 rounded-lg glass-card">
          <div className="flex items-center space-x-3">
            <Avatar className="border-2 border-white dark:border-gray-800">
              <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
              <AvatarFallback>{user?.name?.substring(0, 2) || "DP"}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user?.name || "User"}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || ""}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="h-9 w-9 rounded-full hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
          >
            <X size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
