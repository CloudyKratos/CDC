import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Phone, 
  Compass,
  Gamepad2,
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavigationProps {
  className?: string;
}

const MobileBottomNavigation: React.FC<MobileBottomNavigationProps> = ({ className }) => {
  const location = useLocation();

  const primaryNavItems = [
    { 
      path: '/warrior-space', 
      icon: Gamepad2, 
      label: "CDC's Arena",
      color: 'text-orange-600'
    },
    { 
      path: '/dashboard?tab=command-room', 
      icon: Compass, 
      label: 'Command',
      color: 'text-blue-600'
    },
    { 
      path: '/dashboard?tab=calendar', 
      icon: Calendar, 
      label: 'Calendar',
      color: 'text-green-600'
    },
    { 
      path: '/community', 
      icon: Users, 
      label: 'Community',
      color: 'text-purple-600'
    },
    { 
      path: '/dashboard?tab=stage', 
      icon: Phone, 
      label: 'Stage',
      color: 'text-red-600'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/warrior-space') {
      return location.pathname === '/warrior-space';
    }
    if (path === '/community') {
      return location.pathname === '/community';
    }
    if (path.includes('dashboard?tab=')) {
      const tab = path.split('tab=')[1];
      return location.pathname === '/dashboard' && location.search.includes(`tab=${tab}`);
    }
    return location.pathname === path;
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-lg border-t border-border",
      "mobile-bottom-nav",
      "lg:hidden", // Hide on desktop
      className
    )}>
      <div className="flex items-center justify-around px-2 py-2">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center",
                "touch-target-optimal rounded-xl transition-all duration-200",
                "touch-feedback group relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {active && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-mobile-bounce-in" />
              )}
              
              {/* Icon container with background effect */}
              <div className={cn(
                "relative p-2 rounded-lg transition-all duration-200",
                active 
                  ? "bg-primary/10 scale-110" 
                  : "group-hover:bg-muted/50 group-active:scale-95"
              )}>
                <Icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "drop-shadow-sm"
                )} />
                
                {/* Glow effect for active item */}
                {active && (
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md -z-10 animate-pulse-glow" />
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-xs font-medium mt-1 transition-all duration-200",
                active 
                  ? "text-primary font-semibold" 
                  : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area padding */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default MobileBottomNavigation;