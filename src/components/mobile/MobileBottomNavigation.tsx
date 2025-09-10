import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Sword, Command, Trophy } from 'lucide-react';
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
      path: '/community', 
      icon: Users, 
      label: 'Community',
      isActive: location.pathname === '/community'
    },
    { 
      path: '/dashboard', 
      icon: Command, 
      label: 'Command',
      isActive: location.pathname === '/dashboard' || location.pathname === '/command-room'
    },
    { 
      path: '/dashboard?tab=leaderboard', 
      icon: Trophy, 
      label: 'Leaderboard',
      isActive: location.search.includes('tab=leaderboard')
    },
    { 
      path: '/warrior-space', 
      icon: Sword, 
      label: 'Arena',
      isActive: location.pathname === '/warrior-space'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/30 mobile-safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 p-2 min-h-[48px] min-w-[48px] rounded-xl touch-feedback transition-all duration-200",
                item.isActive
                  ? "text-primary bg-primary/15 shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-all duration-200",
                item.isActive && "scale-110"
              )} />
              <span className={cn(
                "text-xs font-medium truncate max-w-[60px]",
                item.isActive ? "font-semibold" : ""
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;