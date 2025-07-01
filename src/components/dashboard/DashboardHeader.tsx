
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Shield,
  Calendar,
  Users,
  Video,
  Map,
  LayoutGrid,
  Settings,
  User,
  LogOut,
  Menu
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Link, useNavigate } from 'react-router-dom';
import { ActivePanel } from '@/types/dashboard';
import { useNotifications } from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  activePanel: ActivePanel;
  onOpenMobileMenu: () => void;
  onPanelChange: (panel: ActivePanel) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activePanel,
  onOpenMobileMenu,
  onPanelChange
}) => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const isAdmin = currentRole === 'admin';

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/login");
  };

  const getPanelTitle = (panel: ActivePanel) => {
    switch (panel) {
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
      default:
        return "Dashboard";
    }
  };

  const getPanelIcon = (panel: ActivePanel) => {
    switch (panel) {
      case "command-room":
        return <LayoutGrid className="h-5 w-5" />;
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "community":
        return <Users className="h-5 w-5" />;
      case "stage":
        return <Video className="h-5 w-5" />;
      case "worldmap":
        return <Map className="h-5 w-5" />;
      default:
        return <LayoutGrid className="h-5 w-5" />;
    }
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 py-4">
        {/* Left side - Panel info and mobile menu */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onOpenMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400">
              {getPanelIcon(activePanel)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {getPanelTitle(activePanel)}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Welcome back, {user?.name || user?.email?.split('@')[0] || 'Warrior'}
              </p>
            </div>
          </div>
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-3">
          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 max-h-96">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-xs"
                      onClick={markAllAsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          notification.read 
                            ? 'bg-gray-100 dark:bg-gray-800' 
                            : 'bg-blue-50 dark:bg-blue-900/20'
                        }`}>
                          {notification.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            notification.read 
                              ? 'text-gray-700 dark:text-gray-300' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Admin Panel Button */}
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.email}
                    </p>
                    {isAdmin && (
                      <Badge className="bg-red-500 text-white text-[10px]">
                        <Shield className="h-2 w-2 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700">
                  <AvatarImage 
                    src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} 
                    alt="Avatar" 
                  />
                  <AvatarFallback>
                    {user?.name?.slice(0, 2).toUpperCase() || 
                     user?.email?.slice(0, 2).toUpperCase() || 
                     'US'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <Link to="/profile-settings">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
