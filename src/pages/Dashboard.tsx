
import React, { useState } from 'react';
import { useSearchParams, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/components/HomePage';
import CalendarPanel from '@/components/CalendarPanel';
import CommunityPanel from '@/components/CommunityPanel';
import StageRoomPanel from '@/components/stage/StageRoomPanel';
import CommandRoomPanel from '@/components/CommandRoomPanel';
import WorldMapPanel from '@/components/WorldMapPanel';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileMenu from '@/components/dashboard/MobileMenu';
import { Button } from '@/components/ui/button';
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  Shield,
  Map,
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  Settings
} from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { ActivePanel } from '@/types/dashboard';

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activePanel = (searchParams.get("tab") || "command-room") as ActivePanel;
  const { user } = useAuth();
  const { currentRole } = useRole();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handlePanelChange = (panel: ActivePanel) => {
    setSearchParams({ tab: panel });
  };

  const renderContent = () => {
    switch (activePanel) {
      case "command-room":
        return <CommandRoomPanel />;
      case "calendar":
        return <CalendarPanel />;
      case "community":
        return <CommunityPanel channelName="general" />;
      case "stage":
        return <StageRoomPanel />;
      case "worldmap":
        return <WorldMapPanel />;
      default:
        return <CommandRoomPanel />;
    }
  };

  const isAdmin = currentRole === 'admin';

  const navigationItems = [
    { id: "command-room", label: "Command Room", icon: LayoutGrid },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "community", label: "Community", icon: Users },
    { id: "stage", label: "Stage Rooms", icon: Video },
    { id: "worldmap", label: "World Map", icon: Map },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Modern Sidebar */}
      <div className={`hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:w-16' : 'md:w-72'
      }`}>
        <div className="flex flex-col flex-grow bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">W</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Warrior Space
                </h1>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="transition-all duration-200 hover:scale-110"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Navigation */}
          <div className="flex-grow p-4">
            <nav className="space-y-2">
              {/* Home Button - Link to Warrior's Space */}
              <Link to="/warrior-space">
                <Button
                  variant="ghost"
                  className={`w-full transition-all duration-200 hover:scale-105 group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  } h-12 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:text-orange-600 dark:hover:from-orange-900/20 dark:hover:to-red-900/20`}
                >
                  <Home className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">Warrior's Space</span>
                  )}
                </Button>
              </Link>

              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activePanel === item.id ? "default" : "ghost"}
                  className={`w-full transition-all duration-200 hover:scale-105 group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  } h-12 ${
                    activePanel === item.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handlePanelChange(item.id as ActivePanel)}
                >
                  <item.icon className={`h-5 w-5 ${
                    activePanel === item.id ? 'text-white' : ''
                  } group-hover:scale-110 transition-transform duration-200`} />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">{item.label}</span>
                  )}
                </Button>
              ))}

              {/* Quick Profile Settings Access */}
              <div className="pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                <Link to="/profile-settings">
                  <Button
                    variant="ghost"
                    className={`w-full transition-all duration-200 hover:scale-105 group ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                    } h-12 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600`}
                  >
                    <User className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    {!sidebarCollapsed && (
                      <span className="animate-fade-in">Profile Settings</span>
                    )}
                  </Button>
                </Link>
              </div>

              {isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    className={`w-full transition-all duration-200 hover:scale-105 group ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                    } h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20`}
                  >
                    <Shield className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                    {!sidebarCollapsed && (
                      <span className="animate-fade-in">Admin Panel</span>
                    )}
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          {/* User Info */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 animate-fade-in">
              <Link to="/profile-settings" className="block">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <span className="text-white font-semibold text-lg">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Click to edit profile →
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          )}
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
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Header */}
        <DashboardHeader
          activePanel={activePanel}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onPanelChange={handlePanelChange}
        />

        {/* Main Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
          <div className="animate-fade-in min-h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
