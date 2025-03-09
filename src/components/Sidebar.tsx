
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
  Heart
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

// Updated interface to match what Dashboard.tsx is passing
interface SidebarProps {
  viewMode: string;
  setViewMode: (viewMode: string) => void;
  unreadCount: number;
  onSelectItem?: (item: string) => void;
  activeItem?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  viewMode, 
  setViewMode, 
  unreadCount, 
  onSelectItem = () => {}, 
  activeItem = "" 
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [communitiesExpanded, setCommunitiesExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const communities = [
    { id: "stoic", name: "Stoicism", icon: "S", color: "bg-blue-500", notifications: 3 },
    { id: "mindful", name: "Mindfulness", icon: "M", color: "bg-green-500", notifications: 1 },
    { id: "productivity", name: "Productivity", icon: "P", color: "bg-purple-500", notifications: 0 },
    { id: "growth", name: "Growth", icon: "G", color: "bg-orange-500", notifications: 2 },
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
    { id: "chat", label: "Messages", icon: MessageSquare, notifications: 3 },
    { id: "calendar", label: "Calendar", icon: CalendarDays, notifications: 1 },
    { id: "documents", label: "Documents", icon: FileText, notifications: 0 },
    { id: "profile", label: "My Profile", icon: UserCircle, notifications: 0 },
    { id: "analytics", label: "Analytics", icon: BarChart, notifications: 0 },
    { id: "explore", label: "Explore", icon: Compass, notifications: 0 },
    { id: "settings", label: "Settings", icon: Settings, notifications: 0 }
  ];

  // Simplified to just one channel
  const communityChannel = {
    id: "community-general", 
    label: "general", 
    icon: Hash, 
    hasNotification: true, 
    notificationCount: 3, 
    description: "Community discussion"
  };

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleCommunities = () => {
    setCommunitiesExpanded(!communitiesExpanded);
  };
  
  const handleItemSelect = (itemId: string) => {
    onSelectItem(itemId);
    
    // If a community channel is selected, set view mode to "chat"
    if (itemId.startsWith("community-")) {
      setViewMode("chat");
    } else if (itemId === "documents") {
      setViewMode("workspace");
    }
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
                    <span>COMMUNITIES</span>
                    <span className="ml-1 text-xs transition-transform duration-200">
                      {communitiesExpanded ? "▼" : "►"}
                    </span>
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="animate-accordion-down space-y-1">
                {communities.map((community) => (
                  <Button
                    key={community.id}
                    variant={activeItem && activeItem.includes(community.id) ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1 transition-all group",
                      activeItem && activeItem.includes(community.id) 
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleItemSelect(`community-${community.id}`)}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-md mr-2 flex items-center justify-center text-white text-xs font-bold",
                      community.color
                    )}>
                      {community.icon}
                    </div>
                    <span className="truncate flex-1">{community.name}</span>
                    {community.notifications > 0 && (
                      <Badge className="ml-auto h-5 min-w-[20px] p-0 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                        {community.notifications}
                      </Badge>
                    )}
                  </Button>
                ))}
                
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-1 text-sm text-gray-500 dark:text-gray-500 hover:text-primary dark:hover:text-primary-foreground hover:bg-gray-50 dark:hover:bg-gray-800 group"
                >
                  <Plus size={16} className="mr-2 text-gray-400 group-hover:text-primary dark:text-gray-600 dark:group-hover:text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">Join Community</span>
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          <div className="py-4 flex flex-col items-center border-t border-gray-100 dark:border-gray-800 space-y-3">
            {communities.map((community) => (
              <TooltipProvider key={community.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant={activeItem && activeItem.includes(community.id) ? "secondary" : "ghost"}
                      size="icon" 
                      className={cn(
                        "w-10 h-10 rounded-full relative",
                        activeItem && activeItem.includes(community.id) 
                          ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                          : community.color
                      )}
                      onClick={() => handleItemSelect(`community-${community.id}`)}
                    >
                      <span className={cn(
                        "text-sm font-bold",
                        activeItem && activeItem.includes(community.id) ? "text-primary" : "text-white"
                      )}>
                        {community.icon}
                      </span>
                      {community.notifications > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                          {community.notifications}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                    {community.name}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-primary hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <Plus size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                  Join Community
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        
        {activeItem && activeItem.startsWith("community-") && !collapsed && (
          <div className="mt-4 px-3 py-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-800 animate-fade-in">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <Video size={14} className="mr-1.5" /> Live Roundtable
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Join the weekly community discussion on mindfulness practices
            </p>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="text-xs h-7 bg-red-500 hover:bg-red-600">Join Now</Button>
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
      </ScrollArea>
      
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        {collapsed ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Avatar className="cursor-pointer mx-auto hover:ring-2 hover:ring-primary/20 transition-all">
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
                <Avatar className="h-9 w-9 group-hover:ring-2 group-hover:ring-primary/20 transition-all">
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
              <DropdownMenuItem className="flex items-center text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Community chat - now just one channel */}
      {activeItem && activeItem.startsWith("community-") && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-30 md:pl-64 pt-16 transition-all duration-300" style={{ left: collapsed ? "64px" : "256px" }}>
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Hash className="mr-2 text-gray-500" size={20} />
                <h2 className="font-medium text-lg">{communityChannel.label}</h2>
                <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                  <Pin size={10} className="mr-1" /> Featured
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Bell size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Notification settings</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <Users size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Member list</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4">
              <div className="space-y-4">
                {/* Enhanced community chat messages */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 group hover:bg-gray-50 dark:hover:bg-gray-800/30 p-2 rounded-lg transition-colors">
                    <Avatar className="h-8 w-8 mt-1 ring-2 ring-primary/10">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-sm bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">User {i+1}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Today at {10+i}:{Math.floor(Math.random()*60).toString().padStart(2, '0')} AM</span>
                      </div>
                      <p className="text-sm mt-1">This is a message in the community channel. Let's discuss our daily mindfulness practices and share ideas!</p>
                      
                      <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                          <Heart size={12} className="text-gray-500 hover:text-red-500 transition-colors" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                          <MessageSquare size={12} className="text-gray-500 hover:text-primary transition-colors" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Live discussion section with improved visuals */}
                <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 my-6 backdrop-blur-sm">
                  <div className="flex items-center">
                    <Video className="text-red-500 animate-pulse mr-2" size={20} />
                    <h3 className="font-medium bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Live Roundtable Discussion</h3>
                    <Badge className="ml-2 bg-red-500 text-white">LIVE</Badge>
                  </div>
                  <p className="text-sm mt-2">The weekly community roundtable is currently active with 13 participants. Join to discuss this week's topic: "Building consistent mindfulness habits".</p>
                  <Button className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                    Join Call <Sparkles size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Enhanced message input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/80">
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input 
                    placeholder="Message the community..."
                    className="pr-20 rounded-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  />
                </div>
                <Button className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-full">
                  <Send size={16} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
