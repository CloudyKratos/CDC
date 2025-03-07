
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WorkspacePanel } from "@/components/WorkspacePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Sun, Moon, BellRing, MessageCircle, FileText, Users, Settings, X, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type ViewMode = "chat" | "workspace" | "mobile-menu";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [activeItem, setActiveItem] = useState<string>("chat");
  const { toast } = useToast();
  const isMobile = useIsMobile(); 
  
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Check if we should show mobile menu on initial load
    if (isMobile) {
      setViewMode("mobile-menu");
    }
  }, [isMobile]);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have 3 unread notifications.",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Updated to set activeItem state
  const handleSelectItem = (item: string) => {
    setActiveItem(item);
    
    // Set the appropriate view mode based on the selected item
    if (item === "documents") {
      setViewMode("workspace");
    } else if (item.startsWith("community-") || item === "chat") {
      setViewMode("chat");
    }
  };

  // This is the function we'll pass to the Sidebar component 
  // Fixed to match the expected function signature in Sidebar.tsx
  const handleViewModeChange = (newViewMode: string) => {
    // Only set if it's a valid ViewMode
    if (newViewMode === "chat" || newViewMode === "workspace" || newViewMode === "mobile-menu") {
      setViewMode(newViewMode as ViewMode);
    }
  };

  const renderContent = () => {
    if (isMobile && viewMode === "mobile-menu") {
      return (
        <div className="flex-1 flex flex-col p-5 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Nexus Community</h1>
            <ThemeToggle />
          </div>
          
          <div className="flex flex-col space-y-4 mb-6">
            <button 
              className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
              onClick={() => setViewMode("chat")}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <MessageCircle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Community Chat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Connect with others</p>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white animate-pulse-glow">{unreadCount}</Badge>
              )}
            </button>
            
            <button 
              className="flex items-center space-x-3 p-4 rounded-lg glass-card hover:scale-[1.02] transition-all"
              onClick={() => setViewMode("workspace")}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Workspace</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your tasks</p>
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
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                <Users size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Connections</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage your network</p>
              </div>
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
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>DP</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">Demo User</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">user@example.com</p>
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
    }
    
    switch (viewMode) {
      case "chat":
        return <ChatPanel channelType="community" />;
      case "workspace":
        return <WorkspacePanel />;
      default:
        return <ChatPanel channelType="community" />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-background to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80 doodle-pattern">
      {/* Left Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <Sidebar 
          viewMode={viewMode} 
          setViewMode={handleViewModeChange} 
          unreadCount={unreadCount} 
          onSelectItem={handleSelectItem}
          activeItem={activeItem}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navigation Bar */}
        <div className="p-4 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm">
          {/* Mobile Menu Button */}
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setViewMode("mobile-menu")}
              className={viewMode !== "mobile-menu" ? "flex" : "hidden"}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" />
              </svg>
            </Button>
          )}
          
          {/* Title with gradient and sparkle icon */}
          <h1 className={`text-xl font-bold flex items-center gap-2 ${isMobile && viewMode !== "mobile-menu" ? "text-center flex-1" : ""}`}>
            {viewMode === "chat" ? (
              <>
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Community Chat</span>
                <Sparkles size={16} className="text-purple-500 animate-pulse-glow" />
              </>
            ) : "Workspace"}
          </h1>
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNotificationClick}
              className="relative hover:bg-primary/10 rounded-full"
            >
              <BellRing size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              )}
            </Button>
            {!isMobile && <ThemeToggle />}
          </div>
        </div>
        
        {/* Main Content Area with enhanced background effect */}
        <div className="flex-1 relative">
          {/* Decorative floating elements in the background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 -left-32 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float animation-delay-200"></div>
            <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl animate-float animation-delay-400"></div>
          </div>
          
          {/* Actual content */}
          <div className="relative z-10 h-full">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
