
import React, { useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/components/HomePage';
import CalendarPanel from '@/components/CalendarPanel';
import CommunityPanel from '@/components/CommunityPanel';
import StageCallPanel from '@/components/StageCallPanel';
import WorkspacePanel from '@/components/WorkspacePanel';
import WorldMapPanel from '@/components/WorldMapPanel';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileMenu from '@/components/dashboard/MobileMenu';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  User, 
  Home,
  Shield,
  Map
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';

export type ActivePanel = "home" | "workspace" | "calendar" | "community" | "stage" | "worldmap" | "profile";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePanel = (searchParams.get("tab") || "home") as ActivePanel;
  const { user } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handlePanelChange = (panel: ActivePanel) => {
    setSearchParams({ tab: panel });
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleRaiseHand = () => {
    console.log('Hand raised');
  };

  const renderContent = () => {
    switch (activePanel) {
      case "workspace":
        return <WorkspacePanel />;
      case "calendar":
        return <CalendarPanel />;
      case "community":
        return <CommunityPanel channelName="general" />;
      case "stage":
        return (
          <StageCallPanel 
            userName={user.email || 'User'}
            avatarUrl=""
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onRaiseHand={handleRaiseHand}
          />
        );
      case "worldmap":
        return <WorldMapPanel />;
      case "profile":
        return <div className="p-6">Profile Panel Coming Soon</div>;
      default:
        return <HomePage />;
    }
  };

  const isAdmin = currentRole === 'admin';

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white dark:bg-gray-800 overflow-y-auto border-r">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          
          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              <Link to="/warrior-space">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12"
                >
                  <Home className="h-5 w-5" />
                  <span>Warrior's Space</span>
                </Button>
              </Link>
              
              <Button
                variant={activePanel === "home" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("home")}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Button>
              
              <Button
                variant={activePanel === "workspace" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("workspace")}
              >
                <LayoutGrid className="h-5 w-5" />
                <span>Workspace</span>
              </Button>
              
              <Button
                variant={activePanel === "calendar" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("calendar")}
              >
                <Calendar className="h-5 w-5" />
                <span>Calendar</span>
              </Button>
              
              <Button
                variant={activePanel === "community" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("community")}
              >
                <Users className="h-5 w-5" />
                <span>Community</span>
              </Button>
              
              <Button
                variant={activePanel === "stage" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("stage")}
              >
                <Video className="h-5 w-5" />
                <span>Stage Call</span>
              </Button>

              <Button
                variant={activePanel === "worldmap" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("worldmap")}
              >
                <Map className="h-5 w-5" />
                <span>World Map</span>
              </Button>

              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                  </Button>
                </Link>
              )}
              
              <Button
                variant={activePanel === "profile" ? "secondary" : "ghost"}
                className="w-full justify-start gap-3 h-12"
                onClick={() => handlePanelChange("profile")}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <DashboardHeader
          activePanel={activePanel}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPanelChange={handlePanelChange}
        />

        {/* Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
