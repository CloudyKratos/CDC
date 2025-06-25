
import React from 'react';
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Phone, 
  Settings, 
  Shield,
  Compass,
  Globe,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/RoleContext';

interface SidebarProps {
  activePanel: string;
  onPanelChange: (panel: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePanel, onPanelChange }) => {
  const { currentRole, canManageCalendar, canManageUsers } = useRole();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home, requiresAuth: false },
    { id: 'community', label: 'Community', icon: Users, requiresAuth: true },
    { id: 'calendar', label: 'Calendar', icon: Calendar, requiresAuth: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare, requiresAuth: true },
    { id: 'stage-call', label: 'Stage Call', icon: Phone, requiresAuth: true },
    { id: 'world-map', label: 'World Map', icon: Globe, requiresAuth: true },
    { id: 'command-room', label: 'Command Room', icon: Compass, requiresAuth: true },
    { id: 'warrior-space', label: 'Warrior Space', icon: Gamepad2, requiresAuth: true },
  ];

  const adminItems = [
    { id: 'admin', label: 'Admin Panel', icon: Shield, show: currentRole === 'admin' },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h2>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activePanel === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => onPanelChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
        
        {/* Admin Panel - only show for admins */}
        {adminItems.map((item) => {
          if (!item.show) return null;
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activePanel === item.id ? "default" : "ghost"}
              className="w-full justify-start border-t pt-2 mt-2"
              onClick={() => onPanelChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onPanelChange('settings')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
