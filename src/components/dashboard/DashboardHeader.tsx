
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Link } from 'react-router-dom';
import { ActivePanel } from '@/types/dashboard';
import NotificationDropdown from './NotificationDropdown';
import UserProfileDropdown from './UserProfileDropdown';
import PanelInfo from './PanelInfo';

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
  const { isCDCAdmin } = useRole();

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
          
          <PanelInfo 
            activePanel={activePanel} 
            userName={user?.name || user?.email?.split('@')[0]} 
          />
        </div>

        {/* Right side - User actions */}
        <div className="flex items-center gap-3">
          <NotificationDropdown />

          {/* Enhanced Admin Panel Button - Only for CDC Admin */}
          {isCDCAdmin && (
            <Link to="/admin">
              <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 relative group">
                <Shield className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="absolute top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Enhanced Admin Panel
                </div>
              </Button>
            </Link>
          )}

          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
