
import React, { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  CalendarDays, 
  FileText, 
  Users, 
  Settings, 
  X,
  Video,
  Bell,
  UserCircle,
  Moon,
  Sun,
  LogOut,
  BarChart,
  Compass,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Pin,
  Hash,
  Send,
  Plus,
  Heart,
  Trophy,
  Mic,
  BookOpen,
  Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/Logo";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Updated interface to match what Dashboard.tsx is passing
interface SidebarProps {
  viewMode: string;
  setViewMode: (viewMode: string) => void;
  unreadCount: number;
  onSelectItem?: (item: string) => void;
  activeItem?: string;
  activeChannel?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode, 
  setViewMode, 
  unreadCount, 
  onSelectItem = () => {}, 
  activeItem = "",
  activeChannel = "general"
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [communitiesExpanded, setCommunitiesExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  
  // Updated community channels to match Discord-like structure
  const communityChannels = [
    { id: "community-general", label: "general", icon: Hash, hasNotification: true, notificationCount: 2 },
    { id: "community-introduction", label: "introduction", icon: BookOpen, hasNotification: false, notificationCount: 0 },
    { id: "community-hall-of-fame", label: "hall-of-fame", icon: Trophy, hasNotification: false, notificationCount: 0 },
    { id: "community-round-table", label: "round-table", icon: Mic, hasNotification: true, notificationCount: 1 },
  ];
  
  // Added announcements section
  const announcements = [
    { id: "announcement-weekly", title: "Weekly Update", date: "Today", read: false },
    { id: "announcement-event", title: "Upcoming Roundtable", date: "Tomorrow", read: false },
  ];
  
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const mainMenuItems = [
    { id: "home", label: "Home", icon: Home, notifications: 0 },
    { id: "chat", label: "Direct Messages", icon: MessageSquare, notifications: 3 },
    { id: "calendar", label: "Calendar", icon: CalendarDays, notifications: 1 },
    { id: "documents", label: "Hub", icon: FileText, notifications: 0 }, // Changed label from "Documents" to "Hub"
    { id: "profile", label: "My Profile", icon: UserCircle, notifications: 0 },
    { id: "analytics", label: "Analytics", icon: BarChart, notifications: 0 },
    { id: "explore", label: "Explore", icon: Compass, notifications: 0 },
    { id: "settings", label: "Settings", icon: Settings, notifications: 0 }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleCommunities = () => {
    setCommunitiesExpanded(!communitiesExpanded);
  };
  
  const handleItemSelect = (itemId: string) => {
    onSelectItem(itemId);
    
    // If a community channel is selected, set view mode to "community"
    if (itemId.startsWith("community-")) {
      setViewMode("community");
    } else if (itemId === "documents") {
      setViewMode("workspace");
    } else if (itemId === "profile") {
      setViewMode("profile");
    }
  };
  
  const handleLogout = () => {
    toast.success("Successfully logged out");
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div 
      className={cn(
        "h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out z-40 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
        {!collapsed ? (
          <div className="flex items-center space-x-2 group">
            <Logo size="sm" className="transition-transform duration-300 group-hover:scale-110" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Nexus</h1>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-lg cursor-pointer hover:scale-110 transition-transform duration-300">
            <Logo size="sm" />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-all"
        >
          {collapsed ? (
            <ChevronsRight size={18} className="animate-pulse" />
          ) : (
            <ChevronsLeft size={18} />
          )}
        </Button>
      </div>
      
      <ScrollArea className="flex-1 py-4 px-2">
        <div className="space-y-1 mb-6">
          {mainMenuItems.map((item) => (
            <TooltipProvider key={item.id} delayDuration={collapsed ? 100 : 1000}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeItem === item.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1 transition-all relative group overflow-hidden",
                      activeItem === item.id 
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground font-medium" 
                        : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground hover:bg-gray-50 dark:hover:bg-gray-800",
                      collapsed ? "justify-center px-2" : "justify-start px-3",
                      "animate-fade-in"
                    )}
                    onClick={() => handleItemSelect(item.id)}
                  >
                    <item.icon size={20} className={cn(
                      collapsed ? "mx-auto" : "mr-2",
                      "transition-transform duration-300 group-hover:scale-110"
                    )} />
                    {!collapsed && (
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">{item.label}</span>
                    )}
                    
                    {!collapsed && item.notifications > 0 && (
                      <Badge variant="destructive" className="ml-auto px-1 min-w-[20px] h-5 flex items-center justify-center">
                        {item.notifications}
                      </Badge>
                    )}
                    
                    {collapsed && item.notifications > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                        {item.notifications}
                      </Badge>
                    )}
                    
                    <div 
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 transition-transform duration-200",
                        activeItem === item.id && "scale-y-100"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                    {item.label}
                    {item.notifications > 0 && ` (${item.notifications})`}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        
        {!collapsed ? (
          <>
            <Collapsible 
              open={communitiesExpanded} 
              onOpenChange={toggleCommunities}
              className="mb-4 border-t border-gray-100 dark:border-gray-800 pt-4"
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>COMMUNITY</span>
                    <span className="ml-1 text-xs transition-transform duration-200">
                      {communitiesExpanded ? "▼" : "►"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="animate-accordion-down space-y-1">
                {/* Community channels */}
                {communityChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeItem === channel.id || (viewMode === "community" && activeChannel === channel.label) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1 transition-all group",
                      (activeItem === channel.id || (viewMode === "community" && activeChannel === channel.label))
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleItemSelect(channel.id)}
                  >
                    <channel.icon size={18} className="mr-2 opacity-70" />
                    <span className="truncate flex-1">{channel.label}</span>
                    {channel.hasNotification && (
                      <Badge className="ml-auto h-5 min-w-[20px] p-0 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                        {channel.notificationCount}
                      </Badge>
                    )}
                  </Button>
                ))}
                
                {/* Announcements section */}
                <div className="mt-3 mb-1 px-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ANNOUNCEMENTS
                  </p>
                </div>
                
                {announcements.map((announcement) => (
                  <Button
                    key={announcement.id}
                    variant="ghost"
                    className="w-full justify-start mb-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => onSelectItem("home")}
                  >
                    <Megaphone size={18} className="mr-2 opacity-70 text-purple-500" />
                    <div className="flex flex-col items-start text-left">
                      <span className="truncate text-sm">{announcement.title}</span>
                      <span className="text-xs text-gray-500">{announcement.date}</span>
                    </div>
                    {!announcement.read && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </Button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="py-4 flex flex-col items-center border-t border-gray-100 dark:border-gray-800 space-y-3">
            {communityChannels.map((channel) => (
              <TooltipProvider key={channel.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={(viewMode === "community" && activeChannel === channel.label) ? "secondary" : "ghost"}
                      size="icon" 
                      className={cn(
                        "w-10 h-10 rounded-lg relative",
                        (viewMode === "community" && activeChannel === channel.label)
                          ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      )}
                      onClick={() => handleItemSelect(channel.id)}
                    >
                      <channel.icon size={18} />
                      {channel.hasNotification && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                          {channel.notificationCount}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                    {channel.label}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            {/* Announcement icon for collapsed mode */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon" 
                    className="w-10 h-10 rounded-lg relative text-purple-500"
                    onClick={() => onSelectItem("home")}
                  >
                    <Megaphone size={18} />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                      2
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                  Announcements
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {/* Improved Live Roundtable section */}
        {!collapsed && activeItem === "community-round-table" && (
          <div className="mt-4 px-3 py-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg border border-red-200/50 dark:border-red-900/30 backdrop-blur-sm animate-fade-in">
            <h4 className="text-sm font-medium mb-2 flex items-center text-gray-900 dark:text-gray-100">
              <Video size={14} className="mr-1.5 text-red-500" /> Live Roundtable
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Join the weekly community discussion on entrepreneurship strategies
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="text-xs h-7 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white border-0">
                Join Now
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7">Remind Me</Button>
            </div>
            <div className="mt-3 flex -space-x-1.5">
              {[...Array(5)].map((_, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} />
                  <AvatarFallback>U{i}</AvatarFallback>
                </Avatar>
              ))}
              <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">+8</div>
            </div>
          </div>
        )}

        {/* Hall of Fame spotlight section */}
        {!collapsed && (viewMode === "community" && activeChannel === "hall-of-fame") && (
          <div className="mt-4 px-3 py-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-200/50 dark:border-yellow-900/30 backdrop-blur-sm animate-fade-in">
            <h4 className="text-sm font-medium mb-2 flex items-center text-gray-900 dark:text-gray-100">
              <Trophy size={14} className="mr-1.5 text-yellow-500" /> Member Spotlight
            </h4>
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-yellow-200 dark:border-yellow-900/50">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">Alex Smith</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Entrepreneur of the Month</p>
              </div>
            </div>
            <Button size="sm" className="text-xs h-7 w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-0">
              View Achievements
            </Button>
          </div>
        )}
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar 
                  className="cursor-pointer mx-auto hover:ring-2 hover:ring-primary/20 transition-all"
                  onClick={() => onSelectItem("profile")}
                >
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>FX</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                Felix Chen
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                <Avatar 
                  className="h-9 w-9 group-hover:ring-2 group-hover:ring-primary/20 transition-all"
                  onClick={() => onSelectItem("profile")}
                >
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>FX</AvatarFallback>
                </Avatar>
                <div className="ml-2 flex-1">
                  <p className="text-sm font-medium leading-none dark:text-white">Felix Chen</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                    Online
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDarkMode();
                  }}
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-morphism animate-scale-in">
              <div className="p-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="font-medium">felix@example.com</p>
              </div>
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10" onClick={() => handleItemSelect("profile")}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">3</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10" onClick={() => handleItemSelect("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10" onClick={() => toggleDarkMode()}>
                {darkMode ? (
                  <>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="mr-2 h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
