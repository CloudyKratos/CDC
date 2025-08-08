import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Sword, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileBottomNavigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { 
      path: '/', 
      icon: Home, 
      label: 'Home',
      isActive: location.pathname === '/'
    },
    { 
      path: '/dashboard', 
      icon: Command, 
      label: 'Command',
      isActive: location.pathname === '/dashboard' || location.pathname === '/command-room'
    },
    { 
      path: '/dashboard?tab=calendar', 
      icon: Calendar, 
      label: 'Calendar',
      isActive: location.search.includes('tab=calendar') || location.pathname === '/calendar'
    },
    { 
      path: '/community', 
      icon: Users, 
      label: 'Community',
      isActive: location.pathname === '/community'
    },
    { 
      path: '/warrior-space', 
      icon: Sword, 
      label: 'Arena',
      isActive: location.pathname === '/warrior-space'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-lg touch-target transition-all",
                item.isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                item.isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;