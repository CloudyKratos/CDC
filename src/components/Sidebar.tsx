
import React, { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  CalendarDays, 
  FileText, 
  Users, 
  Settings, 
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
  BarChart,
  Compass,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  BookOpen,
  Send,
  Plus,
  Heart,
  Star,
  MessagesSquare,
  Mic,
  Image,
  Smile,
  Pin,
  Flag,
  Bookmark
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SidebarProps {
  onSelectItem: (item: string) => void;
  activeItem: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectItem, activeItem }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [communityExpanded, setCommunityExpanded] = useState(true);
  const [communitiesExpanded, setCommunitiesExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showCommunityDialog, setShowCommunityDialog] = useState(false);
  const [activeCommunity, setActiveCommunity] = useState("stoic");
  
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
    { id: "chat", label: "DMs", icon: MessageSquare, notifications: 3 },
    { id: "calendar", label: "Calendar", icon: CalendarDays, notifications: 1 },
    { id: "documents", label: "Documents", icon: FileText, notifications: 0 },
    { id: "profile", label: "My Profile", icon: UserCircle, notifications: 0 },
    { id: "analytics", label: "Analytics", icon: BarChart, notifications: 0 },
    { id: "explore", label: "Explore", icon: Compass, notifications: 0 },
    { id: "settings", label: "Settings", icon: Settings, notifications: 0 }
  ];

  const communityChannels = [
    { id: "community-general", label: "general", icon: Hash, hasNotification: true, notificationCount: 3, description: "General discussion for community members" },
    { id: "community-announcements", label: "announcements", icon: Megaphone, isPinned: true, description: "Important announcements from moderators" },
    { id: "community-events", label: "events", icon: CalendarDays, description: "Community events and meetups" },
    { id: "community-onboarding", label: "onboarding", icon: Users, description: "New member introductions and guidance" },
    { id: "community-roundtable", label: "roundtable", icon: Video, isLive: true, isExclusive: true, description: "Live community discussions and Q&A sessions" },
    { id: "community-resources", label: "resources", icon: BookOpen, description: "Shared resources and learning materials" }
  ];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleCommunity = () => {
    setCommunityExpanded(!communityExpanded);
  };

  const toggleCommunities = () => {
    setCommunitiesExpanded(!communitiesExpanded);
  };
  
  const handleCommunitySelect = (communityId: string) => {
    setActiveCommunity(communityId);
  };
  
  const getCommunityName = () => {
    const community = communities.find(c => c.id === activeCommunity);
    return community ? community.name : "Community";
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
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">Stoic</h1>
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
                    onClick={() => onSelectItem(item.id)}
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
                
                <Dialog open={showCommunityDialog} onOpenChange={setShowCommunityDialog}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <Plus size={14} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] glass-morphism">
                    <DialogHeader>
                      <DialogTitle>Join a Community</DialogTitle>
                      <DialogDescription>
                        Enter a community code or browse public communities
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="flex space-x-2">
                        <Input placeholder="Community code" className="flex-1" />
                        <Button type="submit">Join</Button>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-medium mb-2">Popular Communities</h4>
                        <div className="space-y-2">
                          {[
                            { name: "Mindful Living", members: "4.2k", category: "Wellness" },
                            { name: "Productive Habits", members: "2.8k", category: "Productivity" },
                            { name: "Growth Mindset", members: "3.5k", category: "Self Development" }
                          ].map((community, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{community.name}</p>
                                <p className="text-xs text-gray-500">{community.category} • {community.members} members</p>
                              </div>
                              <Button size="sm" variant="outline">Join</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <CollapsibleContent className="animate-accordion-down space-y-1">
                {communities.map((community) => (
                  <Button
                    key={community.id}
                    variant={activeCommunity === community.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start mb-1 transition-all group",
                      activeCommunity === community.id 
                        ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    onClick={() => handleCommunitySelect(community.id)}
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
              </CollapsibleContent>
            </Collapsible>
            
            <Collapsible 
              open={communityExpanded} 
              onOpenChange={toggleCommunity}
              className="mb-4 border-t border-gray-100 dark:border-gray-800 pt-4"
            >
              <div className="flex items-center justify-between mb-2 px-2">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span>{getCommunityName().toUpperCase()}</span>
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
                  
                  <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400"
                      >
                        <PlusCircle size={14} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] glass-morphism">
                      <DialogHeader>
                        <DialogTitle>Create a Channel</DialogTitle>
                        <DialogDescription>
                          Add a new channel to {getCommunityName()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Input placeholder="Channel name" />
                          <p className="text-xs text-gray-500 mt-1">Name must be lowercase, without spaces</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Channel Type</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                              <Hash className="mr-2 h-4 w-4" />
                              Text
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Mic className="mr-2 h-4 w-4" />
                              Voice
                            </Button>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-2">Privacy</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="justify-start">
                              <Users className="mr-2 h-4 w-4" />
                              Public
                            </Button>
                            <Button variant="outline" className="justify-start">
                              <Star className="mr-2 h-4 w-4" />
                              Private
                            </Button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full">Create Channel</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <CollapsibleContent className="animate-accordion-down">
                <div className="space-y-1 ml-2">
                  {communityChannels.map((channel) => (
                    <TooltipProvider key={channel.id} delayDuration={500}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
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
                            <channel.icon size={16} className={cn(
                              "mr-2",
                              "transition-transform duration-300 group-hover:scale-110"
                            )} />
                            <span className="truncate transition-transform duration-300 group-hover:translate-x-0.5">
                              {channel.label}
                            </span>
                            
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
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                          {channel.description}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full h-8 justify-start mb-1 text-sm text-gray-500 dark:text-gray-500 hover:text-primary dark:hover:text-primary-foreground hover:bg-gray-50 dark:hover:bg-gray-800 group"
                    onClick={() => setShowChannelDialog(true)}
                  >
                    <PlusCircle size={16} className="mr-2 text-gray-400 group-hover:text-primary dark:text-gray-600 dark:group-hover:text-primary-foreground transition-transform duration-300 group-hover:scale-110" />
                    <span className="transition-transform duration-300 group-hover:translate-x-0.5">Add Channel</span>
                  </Button>
                </div>
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
                      variant={activeCommunity === community.id ? "secondary" : "ghost"}
                      size="icon" 
                      className={cn(
                        "w-10 h-10 rounded-full relative",
                        activeCommunity === community.id 
                          ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                          : community.color
                      )}
                      onClick={() => handleCommunitySelect(community.id)}
                    >
                      <span className={cn(
                        "text-sm font-bold",
                        activeCommunity === community.id ? "text-primary" : "text-white"
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
                    onClick={() => setShowCommunityDialog(true)}
                  >
                    <Plus size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                  Join Community
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="w-8 h-px bg-gray-100 dark:bg-gray-800 my-1"></div>
            
            {communityChannels
              .filter(channel => channel.isLive || channel.isPinned || channel.hasNotification)
              .slice(0, 4)
              .map((channel) => (
                <TooltipProvider key={channel.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant={activeItem === channel.id ? "secondary" : "ghost"}
                        size="icon" 
                        className={cn(
                          "w-10 h-10 rounded-full relative",
                          activeItem === channel.id 
                            ? "bg-secondary dark:bg-gray-800 text-primary dark:text-primary-foreground" 
                            : channel.isLive 
                              ? "bg-red-500/10 text-red-500" 
                              : channel.isPinned 
                                ? "bg-yellow-500/10 text-yellow-500" 
                                : "bg-primary/10 text-primary"
                        )}
                        onClick={() => onSelectItem(channel.id)}
                      >
                        <channel.icon size={18} />
                        {channel.hasNotification && (
                          <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                            {channel.notificationCount}
                          </Badge>
                        )}
                        {channel.isLive && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-black/90 text-white border-0 text-xs py-1 px-2">
                      {channel.label} {channel.isLive && "(Live)"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
            ))}
          </div>
        )}
        
        {activeItem.startsWith("community-") && !collapsed && (
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
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10" onClick={() => onSelectItem("profile")}>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10">
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
                <Badge variant="secondary" className="ml-auto bg-primary/10 text-primary">3</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center cursor-pointer focus:bg-primary/10" onClick={() => onSelectItem("settings")}>
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
      
      {/* Discord-like Chat UI when community channel is selected */}
      {activeItem.startsWith("community-") && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-white dark:bg-gray-900 z-30 md:pl-64 pt-16 transition-all duration-300" style={{ left: collapsed ? "64px" : "256px" }}>
          <div className="flex flex-col h-full">
            <div className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
              <div className="flex items-center">
                <Hash className="mr-2 text-gray-500" size={20} />
                <h2 className="font-medium text-lg">{communityChannels.find(c => c.id === activeItem)?.label}</h2>
                {communityChannels.find(c => c.id === activeItem)?.isPinned && (
                  <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-600 border-yellow-200 dark:border-yellow-900/50">
                    <Pin size={10} className="mr-1" /> Pinned
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pin size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Pin channel</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
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
                {/* Sample messages for the community chat */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 group">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <p className="font-medium text-sm">User {i+1}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Today at {10+i}:{Math.floor(Math.random()*60).toString().padStart(2, '0')} AM</span>
                      </div>
                      <p className="text-sm mt-1">This is a sample message in the {communityChannels.find(c => c.id === activeItem)?.label} channel. Let's discuss our daily mindfulness practices!</p>
                      
                      <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                          <Heart size={12} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                          <MessageSquare size={12} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                          <Bookmark size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {communityChannels.find(c => c.id === activeItem)?.isLive && (
                  <div className="bg-red-500/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 my-4">
                    <div className="flex items-center">
                      <Video className="text-red-500 animate-pulse mr-2" size={20} />
                      <h3 className="font-medium">Live Roundtable Discussion</h3>
                      <Badge className="ml-2 bg-red-500 text-white">LIVE</Badge>
                    </div>
                    <p className="text-sm mt-2">The weekly community roundtable is currently active with 13 participants. Join to discuss this week's topic: "Building consistent mindfulness habits".</p>
                    <Button className="mt-3 bg-red-500 hover:bg-red-600 text-white">Join Call</Button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <PlusCircle size={16} />
                </Button>
                <div className="relative flex-1">
                  <Input 
                    placeholder={`Message #${communityChannels.find(c => c.id === activeItem)?.label}`}
                    className="pr-20 rounded-lg border-gray-200 dark:border-gray-700 focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500">
                      <Image size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500">
                      <Smile size={14} />
                    </Button>
                  </div>
                </div>
                <Button className="bg-primary hover:bg-primary/90">
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
