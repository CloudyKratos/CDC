
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutGrid, 
  Calendar, 
  Users, 
  Video, 
  Shield,
  Map,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { ActivePanel } from '@/types/dashboard';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activePanel: ActivePanel;
  onPanelChange: (panel: ActivePanel) => void;
}

const MobileMenu = ({ isOpen, onClose, activePanel, onPanelChange }: MobileMenuProps) => {
  const { user } = useAuth();
  const { currentRole } = useRole();
  const isAdmin = currentRole === 'admin';

  const navigationItems = [
    { id: "command-room" as const, label: "Command Room", icon: LayoutGrid },
    { id: "calendar" as const, label: "Calendar", icon: Calendar },
    { id: "community" as const, label: "Community", icon: Users },
    { id: "stage" as const, label: "Stage Call", icon: Video },
    { id: "worldmap" as const, label: "World Map", icon: Map },
  ];

  const handlePanelSelect = (panel: ActivePanel) => {
    onPanelChange(panel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Slide-in Menu */}
      <div className="fixed inset-y-0 left-0 w-80 bg-white dark:bg-gray-900 shadow-xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard
              </h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {/* Home Button - Link to Warrior's Space */}
              <Link to="/warrior-space" onClick={onClose}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:text-orange-600 dark:hover:from-orange-900/20 dark:hover:to-red-900/20"
                >
                  <Home className="h-5 w-5" />
                  <span>Warrior's Space</span>
                </Button>
              </Link>

              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activePanel === item.id ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    activePanel === item.id 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => handlePanelSelect(item.id)}
                >
                  <item.icon className={`h-5 w-5 ${
                    activePanel === item.id ? 'text-white' : ''
                  }`} />
                  <span>{item.label}</span>
                </Button>
              ))}

              {isAdmin && (
                <Link to="/admin" onClick={onClose}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Shield className="h-5 w-5" />
                    <span>Admin Panel</span>
                    <Badge variant="destructive" className="ml-auto text-xs">
                      Admin
                    </Badge>
                  </Button>
                </Link>
              )}
            </nav>
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
