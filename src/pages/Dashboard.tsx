
import React, { useState, useEffect } from "react";
import { 
  LayoutGrid, 
  Calendar, 
  MessageSquare, 
  Users, 
  Video,
  User,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MobileMenu, { ActivePanel } from "@/components/dashboard/MobileMenu";
import WorkspacePanel from "@/components/WorkspacePanel";
import CalendarPanel from "@/components/CalendarPanel";
import ChatPanel from "@/components/ChatPanel";
import CommunityPanel from "@/components/CommunityPanel";
import VideoCallPanel from "@/components/VideoCallPanel";
import UserProfilePanel from "@/components/UserProfilePanel";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("workspace");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMobile();
  
  const renderActivePanel = () => {
    switch (activePanel) {
      case "workspace":
        return <WorkspacePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "chat":
        return <ChatPanel />;
      case "community":
        return <CommunityPanel />;
      case "video":
        return <VideoCallPanel />;
      case "profile":
        return <UserProfilePanel />;
      default:
        return <WorkspacePanel />;
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-background">
      <DashboardHeader activePanel={activePanel} onMenuOpen={() => setMobileMenuOpen(true)} />
      
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
                  <LayoutGrid className="h-6 w-6 text-muted-foreground" />
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
              <Button 
                variant={activePanel === "calendar" ? "secondary" : "ghost"}
                size="icon"
                className="w-12 h-12 rounded-xl hover:bg-primary/10"
                onClick={() => setActivePanel("calendar")}
              >
                <Calendar className="h-6 w-6 text-muted-foreground" />
              </Button>
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
                onClick={() => setActivePanel("community")}
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
