
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Bell, 
  Shield,
  Calendar,
  Users,
  Video,
  Map,
  User,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Link } from 'react-router-dom';
import { ActivePanel } from '@/types/dashboard';

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
  const { user } = useAuth();
  const { currentRole } = useRole();
  const isAdmin = currentRole === 'admin';

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
      case "profile":
        return "Profile";
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
      case "profile":
        return <User className="h-5 w-5" />;
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
          {/* Notifications - Empty for new users */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* No notification badge for new users */}
          </Button>

          {/* Admin Panel Button */}
          {isAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}

          {/* User Avatar */}
          <div className="flex items-center gap-3">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
