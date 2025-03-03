
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
  PlusCircle,
  Video,
  Bell,
  UserCircle,
  Upload,
  Megaphone,
  Hash,
  Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./ui/Logo";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  onSelectItem: (item: string) => void;
  activeItem: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectItem, activeItem }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [communityExpanded, setCommunityExpanded] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const mainMenuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "profile", label: "My Profile", icon: UserCircle },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const communityChannels = [
    { id: "community-general", label: "general", icon: Hash, hasNotification: true },
    { id: "community-announcements", label: "announcements", icon: Megaphone },
    { id: "community-events", label: "events", icon: CalendarDays },
    { id: "community-onboarding", label: "onboarding", icon: Users },
    { id: "community-roundtable", label: "roundtable", icon: Video, isLive: true }
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
        <div className="space-y-1 mb-6">
          {mainMenuItems.map((item) => (
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
        
        {!collapsed ? (
          <Collapsible 
            open={communityExpanded} 
            onOpenChange={toggleCommunity}
            className="mb-4 border-t border-gray-100 pt-4"
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent flex items-center text-sm font-medium text-gray-700">
                  <span>COMMUNITY</span>
                  <span className="ml-1 text-xs">
                    {communityExpanded ? "▼" : "►"}
                  </span>
                </Button>
              </CollapsibleTrigger>
              <Badge variant="outline" className="text-xs bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                5 online
              </Badge>
            </div>
            
            <CollapsibleContent>
              <div className="space-y-1 ml-2">
                {communityChannels.map((channel) => (
                  <Button
                    key={channel.id}
                    variant={activeItem === channel.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full h-8 justify-start mb-1 text-sm transition-all",
                      activeItem === channel.id 
                        ? "bg-secondary text-primary font-medium" 
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    )}
                    onClick={() => onSelectItem(channel.id)}
                  >
                    <channel.icon size={16} className="mr-2" />
                    <span className="truncate">{channel.label}</span>
                    {channel.hasNotification && (
                      <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-white text-xs">
                        3
                      </Badge>
                    )}
                    {channel.isLive && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs">Live</Badge>
                    )}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  className="w-full h-8 justify-start mb-1 text-sm text-gray-500 hover:text-primary hover:bg-gray-50"
                >
                  <PlusCircle size={16} className="mr-2" />
                  <span>Add Channel</span>
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="py-2 flex flex-col items-center border-t border-gray-100">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10 rounded-full mb-2 bg-primary/10 text-primary"
              onClick={() => onSelectItem("community-general")}
            >
              <Users size={18} />
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        {collapsed ? (
          <Button 
            variant="outline" 
            size="icon"
            className="w-10 h-10 rounded-full border-dashed border-gray-300 text-gray-600 hover:text-primary hover:border-primary"
          >
            <PlusCircle size={18} />
          </Button>
        ) : (
          <>
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                <UserCircle size={24} />
              </div>
              <div className="ml-2 flex-1">
                <p className="text-sm font-medium leading-none">User Name</p>
                <p className="text-xs text-gray-500 mt-1">Entrepreneur</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-gray-500"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <Settings size={14} />
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-center border-dashed border-gray-300 text-gray-600 hover:text-primary hover:border-primary transition-all duration-200"
            >
              <PlusCircle size={18} className="mr-2" />
              <span>New Workspace</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
