
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WorkspacePanel } from "@/components/WorkspacePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Sun, Moon, BellRing, MessageCircle, FileText, Users, Settings, X, Sparkles, Calendar, Home as HomeIcon } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import HomePage from "@/components/HomePage";
import CalendarPanel from "@/components/CalendarPanel";
import CommunityPanel from "@/components/CommunityPanel";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ProfilePanel from "@/components/ProfilePanel";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

type ViewMode = "home" | "chat" | "workspace" | "calendar" | "mobile-menu" | "community" | "profile";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [activeItem, setActiveItem] = useState<string>("home");
  const [activeChannel, setActiveChannel] = useState<string>("general");
  const { toast: useToastHook } = useToast();
  const isMobile = useIsMobile(); 
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const notifications = [
    {
      id: 1,
      title: "New message",
      description: "John posted in General channel",
      time: "10 min ago",
      read: false,
      type: "message"
    },
    {
      id: 2,
      title: "Event reminder",
      description: "Weekly Round Table starts in 1 hour",
      time: "1 hour ago",
      read: false,
      type: "event"
    },
    {
      id: 3,
      title: "Document shared",
      description: "Sarah shared a business plan with you",
      time: "2 hours ago",
      read: false,
      type: "document"
    },
    {
      id: 4,
      title: "New community member",
      description: "Michael joined the community",
      time: "Yesterday",
      read: true,
      type: "user"
    },
    {
      id: 5,
      title: "System update",
      description: "New features are available",
      time: "2 days ago",
      read: true,
      type: "system"
    },
    {
      id: 6,
      title: "New announcement",
      description: "Community guidelines have been updated",
      time: "3 days ago",
      read: true,
      type: "announcement"
    }
  ];
  
  const latestAnnouncement: AnnouncementProps = {
    id: "rt-001",
    title: "Community Roundtable",
    content: "Join us this Friday at 3PM for our weekly Roundtable discussion on startup growth strategies.",
    date: "Friday, 3:00 PM",
    type: "roundtable",
    attendees: 12,
    maxAttendees: 30
  };
  
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
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
    setNotificationsOpen(true);
  };

  const handleLogout = () => {
    toast.success("Successfully logged out");
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSelectItem = (item: string) => {
    setActiveItem(item);
    
    if (item === "home") {
      setViewMode("home");
    } else if (item === "documents") {
      setViewMode("workspace");
    } else if (item === "calendar") {
      setViewMode("calendar");
    } else if (item === "profile") {
      setViewMode("profile");
    } else if (item === "chat") {
      setViewMode("chat");
    } else if (
      item === "community-general" || 
      item === "community-introduction" || 
      item === "community-hall-of-fame" || 
      item === "community-round-table"
    ) {
      setViewMode("community");
      setActiveChannel(item.replace("community-", ""));
    }
  };

  const handleViewModeChange = (newViewMode: string) => {
    if (["home", "chat", "workspace", "calendar", "mobile-menu", "community", "profile"].includes(newViewMode)) {
      setViewMode(newViewMode as ViewMode);
    }
  };

  const renderContent = () => {
    if (isMobile && viewMode === "mobile-menu") {
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
                setActiveChannel("general");
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
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>FX</AvatarFallback>
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
      case "home":
        return (
          <>
            <AnnouncementBanner announcement={latestAnnouncement} />
            <HomePage />
          </>
        );
      case "chat":
        return <ChatPanel channelType="direct" />;
      case "community":
        return <CommunityPanel channelName={activeChannel} />;
      case "workspace":
        return <WorkspacePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "profile":
        return <ProfilePanel />;
      default:
        return (
          <>
            <AnnouncementBanner announcement={latestAnnouncement} />
            <HomePage />
          </>
        );
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-background to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80 doodle-pattern">
      {!isMobile && (
        <Sidebar 
          viewMode={viewMode} 
          setViewMode={handleViewModeChange} 
          unreadCount={unreadCount} 
          onSelectItem={handleSelectItem}
          activeItem={activeItem}
          activeChannel={activeChannel}
        />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="p-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm sticky top-0 z-30">
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
          
          <div className={`text-xl font-bold flex items-center gap-2 ${isMobile && viewMode !== "mobile-menu" ? "text-center flex-1" : ""}`}>
            {viewMode === "home" ? (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">Home</span>
            ) : viewMode === "chat" ? (
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
                Direct Messages
              </span>
            ) : viewMode === "community" ? (
              <>
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
                  {activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1).replace(/-/g, ' ')}
                </span>
                <Sparkles size={16} className="text-purple-500 animate-pulse-glow" />
              </>
            ) : viewMode === "workspace" ? (
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">Documents</span>
            ) : viewMode === "calendar" ? (
              <span className="bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">Calendar</span>
            ) : viewMode === "profile" ? (
              <span className="bg-gradient-to-r from-green-400 to-teal-500 text-transparent bg-clip-text">Profile</span>
            ) : (
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Dashboard</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNotificationClick}
                  className="relative hover:bg-primary/10 rounded-full h-9 w-9"
                >
                  <BellRing size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0 mr-2" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{unreadCount} new</Badge>
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="py-2">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'border-l-2 border-primary' : ''}`}
                      >
                        <div className="flex gap-3 items-start">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            notification.type === 'message' 
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                              : notification.type === 'event'
                              ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                              : notification.type === 'document'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              : notification.type === 'user'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : notification.type === 'announcement'
                              ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                          }`}>
                            {notification.type === 'message' ? <MessageCircle size={16} /> :
                             notification.type === 'event' ? <Calendar size={16} /> :
                             notification.type === 'document' ? <FileText size={16} /> :
                             notification.type === 'user' ? <Users size={16} /> :
                             notification.type === 'announcement' ? <BellRing size={16} /> :
                             <Settings size={16} />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{notification.title}</p>
                            <p className="text-xs text-muted-foreground">{notification.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t text-center">
                  <Button variant="ghost" className="w-full text-sm">View All Notifications</Button>
                </div>
              </PopoverContent>
            </Popover>
            {!isMobile && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={toggleDarkMode}
                className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 -left-32 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float animation-delay-200"></div>
            <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl animate-float animation-delay-400"></div>
          </div>
          
          <div className="relative z-10 h-full overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
