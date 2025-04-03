import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MobileMenu from "@/components/dashboard/MobileMenu";
import UserProfilePanel from "@/components/UserProfilePanel";
import WorkspacePanel from "@/components/WorkspacePanel";
import CalendarPanel from "@/components/CalendarPanel";
import { ChatPanel } from "@/components/ChatPanel";
import CommunityPanel from "@/components/CommunityPanel";
import VideoCallPanel from "@/components/VideoCallPanel";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ActivePanel = "workspace" | "calendar" | "chat" | "community" | "video" | "profile";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>("workspace");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("workspace");
  const [activeChannel, setActiveChannel] = useState("general");
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const { user } = useAuth();

  const handlePanelChange = (panel: ActivePanel) => {
    setActivePanel(panel);
    setIsMobileMenuOpen(false);

    // Update viewMode based on panel
    if (panel === "community") {
      setViewMode("community");
    } else if (panel === "workspace") {
      setViewMode("workspace");
    } else if (panel === "profile") {
      setViewMode("profile");
    } else {
      setViewMode(panel);
    }
  };

  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSelectItem = (itemId: string) => {
    // Handle community channel selection
    if (itemId.startsWith("community-")) {
      const channelName = itemId.replace("community-", "");
      setActiveChannel(channelName);
      setActivePanel("community");
      setViewMode("community");
    } else if (itemId === "profile") {
      setActivePanel("profile");
    } else if (itemId === "chat") {
      setActivePanel("chat");
    } else if (itemId === "calendar") {
      setActivePanel("calendar");
    } else if (itemId === "video") {
      setActivePanel("video");
      setIsVideoCallOpen(true);
    }
  };

  const handleCloseVideoCall = () => {
    setIsVideoCallOpen(false);
    setActivePanel("workspace");
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
        return <CommunityPanel channelName={activeChannel} />;
      case "video":
        return <VideoCallPanel isOpen={isVideoCallOpen} onClose={handleCloseVideoCall} />;
      case "profile":
        return <UserProfilePanel />;
      default:
        return <WorkspacePanel />;
    }
  };

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
        viewMode={viewMode}
        setViewMode={setViewMode}
        unreadCount={3}
        onSelectItem={handleSelectItem}
        activeItem={activePanel}
        activeChannel={activeChannel}
      />

      <MobileMenu
        open={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          panel={activePanel}
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
