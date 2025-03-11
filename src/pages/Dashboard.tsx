
import React, { useState, useEffect, useContext } from "react";
import { Sidebar } from "@/components/Sidebar";
import { WorkspacePanel } from "@/components/WorkspacePanel";
import { ChatPanel } from "@/components/ChatPanel";
import { MessageCircle, Calendar, Users, FileText, BellRing, Settings } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../App";
import MobileMenu from "@/components/dashboard/MobileMenu";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import HomePage from "@/components/HomePage";
import CalendarPanel from "@/components/CalendarPanel";
import CommunityPanel from "@/components/CommunityPanel";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ProfilePanel from "@/components/ProfilePanel";
import { NotificationType } from "@/types/notification";
import { AnnouncementProps } from "@/types/announcement";

type ViewMode = "home" | "chat" | "workspace" | "calendar" | "mobile-menu" | "community" | "profile";

const Dashboard = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [unreadCount, setUnreadCount] = useState<number>(3);
  const [activeItem, setActiveItem] = useState<string>("home");
  const [activeChannel, setActiveChannel] = useState<string>("general");
  const isMobile = useIsMobile(); 
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const notifications: NotificationType[] = [
    {
      id: 1,
      title: "New message",
      description: "John posted in General channel",
      time: "10 min ago",
      read: false,
      type: "message",
      icon: <MessageCircle className="h-4 w-4" />
    },
    {
      id: 2,
      title: "Event reminder",
      description: "Weekly Round Table starts in 1 hour",
      time: "1 hour ago",
      read: false,
      type: "event",
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 3,
      title: "Document shared",
      description: "Sarah shared a business plan with you",
      time: "2 hours ago",
      read: false,
      type: "document",
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 4,
      title: "New community member",
      description: "Michael joined the community",
      time: "Yesterday",
      read: true,
      type: "user",
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 5,
      title: "System update",
      description: "New features are available",
      time: "2 days ago",
      read: true,
      type: "system",
      icon: <Settings className="h-4 w-4" />
    },
    {
      id: 6,
      title: "New announcement",
      description: "Community guidelines have been updated",
      time: "3 days ago",
      read: true,
      type: "announcement",
      icon: <BellRing className="h-4 w-4" />
    }
  ];
  
  const latestAnnouncement: AnnouncementProps = {
    id: "rt-001",
    title: "Community Roundtable",
    content: "Join us this Friday at 3PM for our weekly Roundtable discussion on startup growth strategies.",
    date: "Friday, 3:00 PM",
    type: "roundtable",
    attendees: 12,
    maxAttendees: 30
  };
  
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    if (isMobile) {
      setViewMode("mobile-menu");
    }
  }, [isMobile]);
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(true);
  };

  const handleSelectItem = (item: string) => {
    setActiveItem(item);
    
    if (item === "home") {
      setViewMode("home");
    } else if (item === "documents") {
      setViewMode("workspace");
    } else if (item === "calendar") {
      setViewMode("calendar");
    } else if (item === "profile") {
      setViewMode("profile");
    } else if (item === "chat") {
      setViewMode("chat");
    } else if (
      item === "community-general" || 
      item === "community-introduction" || 
      item === "community-hall-of-fame" || 
      item === "community-round-table"
    ) {
      setViewMode("community");
      setActiveChannel(item.replace("community-", ""));
    }
  };

  const handleViewModeChange = (newViewMode: string) => {
    if (["home", "chat", "workspace", "calendar", "mobile-menu", "community", "profile"].includes(newViewMode)) {
      setViewMode(newViewMode as ViewMode);
    }
  };

  const renderContent = () => {
    if (isMobile && viewMode === "mobile-menu") {
      return (
        <MobileMenu 
          unreadCount={unreadCount}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setViewMode={handleViewModeChange}
          handleNotificationClick={handleNotificationClick}
          user={user}
        />
      );
    }
    
    switch (viewMode) {
      case "home":
        return (
          <>
            <AnnouncementBanner announcement={latestAnnouncement} />
            <HomePage />
          </>
        );
      case "chat":
        return <ChatPanel channelType="direct" />;
      case "community":
        return <CommunityPanel channelName={activeChannel} />;
      case "workspace":
        return <WorkspacePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "profile":
        return <ProfilePanel />;
      default:
        return (
          <>
            <AnnouncementBanner announcement={latestAnnouncement} />
            <HomePage />
          </>
        );
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gradient-to-br from-gray-50 via-background to-gray-50/80 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800/80">
      {!isMobile && (
        <Sidebar 
          viewMode={viewMode} 
          setViewMode={handleViewModeChange} 
          unreadCount={unreadCount} 
          onSelectItem={handleSelectItem}
          activeItem={activeItem}
          activeChannel={activeChannel}
        />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <DashboardHeader 
          isMobile={isMobile}
          viewMode={viewMode}
          activeChannel={activeChannel}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          setViewMode={handleViewModeChange}
          unreadCount={unreadCount}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          notifications={notifications}
        />
        
        <div className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute top-1/3 -left-32 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float animation-delay-200"></div>
            <div className="absolute -bottom-20 right-1/3 w-64 h-64 bg-green-500/10 dark:bg-green-500/5 rounded-full blur-3xl animate-float animation-delay-400"></div>
          </div>
          
          <div className="relative z-10 h-full overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
