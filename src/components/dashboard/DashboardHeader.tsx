
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, Bell, Search, User, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ActivePanel } from '@/types/dashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DashboardHeaderProps {
  activePanel: ActivePanel;
  onOpenMobileMenu: () => void;
  onPanelChange: (panel: ActivePanel) => void;
}

const DashboardHeader = ({ activePanel, onOpenMobileMenu, onPanelChange }: DashboardHeaderProps) => {
  const { user } = useAuth();

  const getPanelTitle = (panel: ActivePanel) => {
    switch (panel) {
      case 'command-room': return 'Command Room';
      case 'calendar': return 'Calendar';
      case 'community': return 'Community';
      case 'stage': return 'Stage Rooms';
      default: return 'Dashboard';
    }
  };

  const getPanelDescription = (panel: ActivePanel) => {
    switch (panel) {
      case 'command-room': return 'Your main workspace and control center';
      case 'calendar': return 'Manage your events and schedules';
      case 'community': return 'Connect and chat with fellow warriors';
      case 'stage': return 'Live sessions and presentations';
      default: return 'Elite Command Center';
    }
  };

  return (
    <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 md:px-6 md:py-4">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button & Title */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenMobileMenu}
            className="md:hidden hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {getPanelTitle(activePanel)}
            </h1>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {getPanelDescription(activePanel)}
            </p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search - Hidden on small screens */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Search className="h-4 w-4 md:h-5 md:w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 md:px-3 py-2"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-xs md:text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4 text-gray-500 hidden sm:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 md:w-56">
              <DropdownMenuItem className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
