import React, { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  CalendarDays, 
  FileText, 
  Users, 
  Settings, 
  Menu, 
  X,
  PlusCircle,
  Video,
  Bell,
  UserCircle,
  Megaphone,
  Hash,
  Moon,
  Sun,
  LogOut,
  Package,
  BarChart,
  Compass,
  Zap,
  Star,
  ChevronsLeft,
  ChevronsRight
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

interface SidebarProps {
  onSelectItem: (item: string) => void;
  activeItem: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectItem, activeItem }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [communityExpanded, setCommunityExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
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
    { id: "chat", label: "DMs", icon: MessageSquare, notifications: 3 },
    { id: "calendar", label: "Calendar", icon: CalendarDays, notifications: 1 },
    { id: "documents", label: "Documents", icon: FileText, notifications: 0 },
    { id: "profile", label: "My Profile", icon: UserCircle, notifications: 0 },
    { id: "analytics", label: "Analytics", icon: BarChart, notifications: 0 },
    { id: "explore", label: "Explore", icon: Compass, notifications: 0 },
    { id: "settings", label: "Settings", icon: Settings, notifications: 0 }
  ];

  const communityChannels = [
    { id: "community-general", label: "general", icon: Hash, hasNotification: true, notificationCount: 3 },
    { id: "community-announcements", label: "announcements", icon: Megaphone, isPinned: true },
    { id: "community-events", label: "events", icon: CalendarDays },
    { id: "community-onboarding", label: "onboarding", icon: Users },
    { id: "community-roundtable", label: "roundtable", icon: Video, isLive: true, isExclusive: true }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleCommunity = () => {
    setCommunityExpanded(!communityExpanded);
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
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Stoic</h1>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto flex items-center justify-center bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Logo size="sm" />
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground transition-all"
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin">
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
                    onClick={() => onSelectItem(item.id)}
                  >
                    <item.icon size={20} className={collapsed ? "mx-auto" : "mr-2"} />
                    {!collapsed && <span>{item.label}</span>}
                    
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
          <Collapsible 
            open={communityExpanded} 
            onOpenChange={toggleCommunity}
            className="mb-4 border-t border-gray-100 dark:border-gray-800 pt-4"
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>COMMUNITY</span>
                  <span className="ml-1 text-xs transition-transform duration-200">
                    {communityExpanded ? "▼" : "►"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900/50">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1"></span>
                  5 online
                </Badge>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                >
                  <PlusCircle size={14} />
                </Button>
              </div>
            </div>
            
            <CollapsibleContent className="animate-accordion-down">
              <div className="space-y-1 ml-2">
                {communityChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeItem === channel.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-8 justify-start mb-1 text-sm transition-all group relative",
                      activeItem === channel.id 
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground font-medium" 
                        : "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-foreground hover:bg-gray-50 dark:hover:bg-gray-800",
                      channel.isPinned && "border-l-2 border-yellow-500 pl-[10px]"
                    )}
                    onClick={() => onSelectItem(channel.id)}
                  >
                    <channel.icon size={16} className="mr-2" />
                    <span className="truncate">{channel.label}</span>
                    
                    {channel.isExclusive && (
                      <span className="ml-1 text-[10px] text-yellow-500">★</span>
                    )}
                    
                    {channel.hasNotification && (
                      <Badge className="ml-auto h-5 min-w-[20px] p-0 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                        {channel.notificationCount}
                      </Badge>
                    )}
                    
                    {channel.isLive && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs animate-pulse">
                        Live
                      </Badge>
                    )}
                    
                    <div 
                      className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 transition-transform duration-200",
                        activeItem === channel.id && "scale-y-100",
                        channel.isPinned && "hidden"
                      )}
                    />
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full h-8 justify-start mb-1 text-sm text-gray-500 dark:text-gray-500 hover:text-primary dark:hover:text-primary-foreground hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <PlusCircle size={16} className="mr-2 text-gray-400 group-hover:text-primary dark:text-gray-600 dark:group-hover:text-primary-foreground" />
                  <span>Add Channel</span>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="py-4 flex flex-col items-center border-t border-gray-100 dark:border-gray-800 space-y-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant={activeItem.startsWith("community-") ? "secondary" : "ghost"}
                    size="icon" 
                    className={cn(
                      "w-10 h-10 rounded-full relative",
                      activeItem.startsWith("community-") 
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                        : "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground"
                    )}
                    onClick={() => onSelectItem("community-general")}
                  >
                    <Users size={18} />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                      3
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                  Community
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full bg-red-500/10 text-red-500"
                    onClick={() => onSelectItem("community-roundtable")}
                  >
                    <Video size={18} />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                  Roundtable Live
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="cursor-pointer mx-auto">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                User Profile
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>UN</AvatarFallback>
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
                  className="h-8 w-8 text-gray-500 dark:text-gray-400" 
                  onClick={() => toggleDarkMode()}
                >
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => onSelectItem("profile")}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <Badge variant="secondary" className="ml-auto">3</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => onSelectItem("settings")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer" onClick={() => toggleDarkMode()}>
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
              <DropdownMenuItem className="flex items-center text-red-500 focus:text-red-500 cursor-pointer">
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
