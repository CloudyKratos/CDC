
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
import { Badge } from '@/components/ui/badge';
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  Shield,
  Map,
  ChevronLeft,
  ChevronRight,
  Sword,
  User,
  Settings,
  Bell
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
    { 
      id: "command-room", 
      label: "Command Room", 
      icon: LayoutGrid, 
      description: "Main workspace",
      color: "blue"
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      icon: Calendar, 
      description: "Events & meetings",
      color: "green"
    },
    { 
      id: "community", 
      label: "Community", 
      icon: Users, 
      description: "Chat & connect",
      color: "purple"
    },
    { 
      id: "stage", 
      label: "Stage Rooms", 
      icon: Video, 
      description: "Live sessions",
      color: "red"
    },
    { 
      id: "worldmap", 
      label: "World Map", 
      icon: Map, 
      description: "Global view",
      color: "yellow"
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Sidebar */}
      <div className={`hidden md:flex md:flex-col transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'md:w-20' : 'md:w-80'
      }`}>
        <div className="flex flex-col flex-grow bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    CDC
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Elite Command Center</p>
                </div>
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
              {/* CDC's Arena Button */}
              <Link to="/warrior-space">
                <Button
                  variant="ghost"
                  className={`w-full transition-all duration-200 hover:scale-105 group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  } h-14 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:text-orange-600 dark:hover:from-orange-900/20 dark:hover:to-red-900/20 border-2 border-dashed border-orange-300 dark:border-orange-700 mb-4`}
                >
                  <div className="relative">
                    <Sword className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                  </div>
                  {!sidebarCollapsed && (
                    <div className="animate-fade-in">
                      <div className="font-bold text-lg">CDC's Arena</div>
                      <div className="text-xs text-gray-500">Elite Training Ground</div>
                    </div>
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
                  <div className="relative">
                    <item.icon className={`h-5 w-5 ${
                      activePanel === item.id ? 'text-white' : ''
                    } group-hover:scale-110 transition-transform duration-200`} />
                    {activePanel === item.id && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="animate-fade-in flex-1 text-left">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs opacity-70">{item.description}</div>
                    </div>
                  )}
                  {!sidebarCollapsed && activePanel === item.id && (
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Active
                    </Badge>
                  )}
                </Button>
              ))}

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 mt-4">
                <Link to="/profile-settings">
                  <Button
                    variant="ghost"
                    className={`w-full transition-all duration-200 hover:scale-105 group ${
                      sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                    } h-10 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600`}
                  >
                    <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    {!sidebarCollapsed && (
                      <span className="animate-fade-in">Profile Settings</span>
                    )}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className={`w-full transition-all duration-200 hover:scale-105 group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  } h-10 hover:bg-gray-50 dark:hover:bg-gray-700/50`}
                >
                  <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">Settings</span>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className={`w-full transition-all duration-200 hover:scale-105 group ${
                    sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                  } h-10 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:text-yellow-600 relative`}
                >
                  <Bell className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <div className="absolute top-2 left-6 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  {!sidebarCollapsed && (
                    <span className="animate-fade-in">Notifications</span>
                  )}
                </Button>

                {isAdmin && (
                  <Link to="/admin">
                    <Button
                      variant="ghost"
                      className={`w-full transition-all duration-200 hover:scale-105 group ${
                        sidebarCollapsed ? 'justify-center px-0' : 'justify-start gap-3'
                      } h-10 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20`}
                    >
                      <Shield className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      {!sidebarCollapsed && (
                        <span className="animate-fade-in">Admin Panel</span>
                      )}
                    </Button>
                  </Link>
                )}
              </div>
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
