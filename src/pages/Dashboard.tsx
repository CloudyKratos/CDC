
import React, { useState, useEffect } from "react";
import { 
  LayoutGrid, 
  Calendar, 
  MessageSquare, 
  Users, 
  Video,
  User,
  Home,
  Menu,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MobileMenu, { ActivePanel } from "@/components/dashboard/MobileMenu";
import WorkspacePanel from "@/components/WorkspacePanel";
import CalendarPanel from "@/components/CalendarPanel";
import AdminCalendarPanel from "@/components/calendar/AdminCalendarPanel";
import UserCalendarPanel from "@/components/calendar/UserCalendarPanel";
import { ChatPanel } from "@/components/ChatPanel";
import DiscordCommunityPanel from "@/components/community/DiscordCommunityPanel";
import VideoCallPanel from "@/components/VideoCallPanel";
import UserProfilePanel from "@/components/UserProfilePanel";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("workspace");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState("general");
  const [viewMode, setViewMode] = useState("user"); // "user" or "admin"
  const isMobile = useMobile();
  const { user } = useAuth();
  
  // Check if user is admin (for demo purposes)
  const isAdmin = user?.email?.includes("admin") || false;
  
  useEffect(() => {
    // Default to user view unless explicitly set to admin
    if (!isAdmin && viewMode === "admin") {
      setViewMode("user");
    }
  }, [isAdmin, viewMode]);
  
  const handleCommunitySelect = (channelName: string) => {
    setActivePanel("community");
    setActiveChannel(channelName);
  };
  
  const renderActivePanel = () => {
    switch (activePanel) {
      case "workspace":
        return <WorkspacePanel />;
      case "calendar":
        if (viewMode === "admin" && isAdmin) {
          return <AdminCalendarPanel />;
        } else {
          return <UserCalendarPanel />;
        }
      case "chat":
        return <ChatPanel />;
      case "community":
        return <DiscordCommunityPanel defaultChannel={activeChannel} />;
      case "video":
        return <VideoCallPanel isOpen={true} onClose={() => setActivePanel("workspace")} />;
      case "profile":
        return <UserProfilePanel />;
      default:
        return <WorkspacePanel />;
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader 
        activePanel={activePanel} 
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
        onPanelChange={setActivePanel}
      />
      
      <main className="flex flex-1 overflow-hidden">
        {!isMobile && (
          <div className="w-20 flex-shrink-0 border-r h-full py-4 flex flex-col items-center">
            <div className="space-y-6 flex flex-col items-center">
              <Link to="/home">
                <Button 
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 rounded-xl hover:bg-primary/10"
                >
                  <Home className="h-6 w-6 text-muted-foreground" />
                </Button>
              </Link>
              <Button 
                variant={activePanel === "workspace" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => setActivePanel("workspace")}
              >
                <LayoutGrid className="h-6 w-6 text-muted-foreground" />
              </Button>
              
              {activePanel === "calendar" && isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="secondary"
                      size="icon"
                      className="w-12 h-12 rounded-xl relative"
                    >
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                      {viewMode === "admin" && (
                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                          <Shield size={10} />
                        </div>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="center" className="w-40">
                    <DropdownMenuItem onClick={() => setViewMode("user")}>
                      User View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setViewMode("admin")}>
                      Admin View
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant={activePanel === "calendar" ? "secondary" : "ghost"}
                  size="icon"
                  className="w-12 h-12 rounded-xl hover:bg-primary/10"
                  onClick={() => setActivePanel("calendar")}
                >
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </Button>
              )}
              
              <Button 
                variant={activePanel === "chat" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => setActivePanel("chat")}
              >
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </Button>
              
              <Button 
                variant={activePanel === "community" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => handleCommunitySelect("general")}
              >
                <Users className="h-6 w-6 text-muted-foreground" />
              </Button>
              
              <Button 
                variant={activePanel === "video" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => setActivePanel("video")}
              >
                <Video className="h-6 w-6 text-muted-foreground" />
              </Button>
            </div>
            
            <div className="mt-auto">
              <Button 
                variant={activePanel === "profile" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => setActivePanel("profile")}
              >
                <User className="h-6 w-6 text-muted-foreground" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          {renderActivePanel()}
        </div>
      </main>
      
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activePanel={activePanel}
        onPanelChange={setActivePanel}
      />
    </div>
  );
};

export default Dashboard;
