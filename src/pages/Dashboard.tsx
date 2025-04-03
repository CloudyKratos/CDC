
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileMenu } from "@/components/dashboard/MobileMenu";
import UserProfilePanel from "@/components/UserProfilePanel";
import WorkspacePanel from "@/components/WorkspacePanel";
import CalendarPanel from "@/components/CalendarPanel";
import ChatPanel from "@/components/ChatPanel";
import CommunityPanel from "@/components/CommunityPanel";
import VideoCallPanel from "@/components/VideoCallPanel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ActivePanel = "workspace" | "calendar" | "chat" | "community" | "video" | "profile";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("workspace");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel);
    setIsMobileMenuOpen(false);
  };

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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

  // Welcome message with user's name
  React.useEffect(() => {
    if (user) {
      // Show welcome toast only on first render
      toast.success(`Welcome back, ${user.name}!`, {
        description: "We're glad to see you again.",
        duration: 5000,
      });
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          activePanel={activePanel}
          onOpenMobileMenu={handleOpenMobileMenu}
          onPanelChange={handlePanelChange}
        />

        <div className="flex-1 overflow-auto">
          {renderActivePanel()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
