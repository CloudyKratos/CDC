
import React from "react";
import { 
  Bell, 
  Menu, 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  Search,
  User,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { ActivePanel } from "@/types/dashboard";

export interface DashboardHeaderProps {
  activePanel: ActivePanel;
  onOpenMobileMenu: () => void;
  onPanelChange: (panel: ActivePanel) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activePanel,
  onOpenMobileMenu,
  onPanelChange
}) => {
  const { user } = useAuth();

  const renderPanelTitle = () => {
    switch (activePanel) {
      case "command-room":
        return "Command Room";
      case "calendar":
        return "Calendar";
      case "community":
        return "Community";
      case "stage":
        return "Stage Call";
      case "worldmap":
        return "World Map";
      case "profile":
        return "Profile";
      default:
        return "Dashboard";
    }
  };

  return (
    <header className="border-b bg-gradient-to-r from-background to-muted/30 backdrop-blur-sm">
      <div className="flex h-16 items-center px-4">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onOpenMobileMenu}>
          <Menu className="h-6 w-6" />
        </Button>
        
        <div className="hidden md:flex items-center gap-2 mr-4">
          <Button 
            variant={activePanel === "command-room" ? "default" : "ghost"} 
            size="sm"
            onClick={() => onPanelChange("command-room")}
            className="gap-1 transition-all duration-200 hover:scale-105"
          >
            <LayoutGrid className="h-4 w-4" />
            <span>Command Room</span>
          </Button>
          
          <Button 
            variant={activePanel === "calendar" ? "default" : "ghost"} 
            size="sm"
            onClick={() => onPanelChange("calendar")}
            className="gap-1 transition-all duration-200 hover:scale-105"
          >
            <Calendar className="h-4 w-4" />
            <span>Calendar</span>
          </Button>
          
          <Button 
            variant={activePanel === "community" ? "default" : "ghost"} 
            size="sm"
            onClick={() => onPanelChange("community")}
            className="gap-1 transition-all duration-200 hover:scale-105"
          >
            <Users className="h-4 w-4" />
            <span>Community</span>
          </Button>
          
          <Button 
            variant={activePanel === "stage" ? "default" : "ghost"} 
            size="sm"
            onClick={() => onPanelChange("stage")}
            className="gap-1 transition-all duration-200 hover:scale-105"
          >
            <Video className="h-4 w-4" />
            <span>Stage</span>
          </Button>

          <Button 
            variant={activePanel === "worldmap" ? "default" : "ghost"} 
            size="sm"
            onClick={() => onPanelChange("worldmap")}
            className="gap-1 transition-all duration-200 hover:scale-105"
          >
            <Map className="h-4 w-4" />
            <span>World Map</span>
          </Button>
        </div>
        
        <div className="md:hidden font-semibold">{renderPanelTitle()}</div>
        
        <div className="ml-auto flex items-center gap-2">
          <div className="relative md:w-64 hidden md:block">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 transition-all duration-200 focus:ring-2" />
          </div>
          
          <Button variant="ghost" size="icon" className="relative transition-all duration-200 hover:scale-110">
            <Bell className="h-5 w-5" />
            <span className="absolute h-2 w-2 top-1 right-1 rounded-full bg-red-500 animate-pulse"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full transition-all duration-200 hover:scale-110">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} alt="Avatar" />
                  <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-in slide-in-from-top-2">
              <DropdownMenuItem onClick={() => onPanelChange("profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
