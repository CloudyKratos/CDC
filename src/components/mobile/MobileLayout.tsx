import React from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNavigation from './MobileBottomNavigation';
import MobileDashboard from './MobileDashboard';

import MobileWarriorSpace from './MobileWarriorSpace';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();

  // Don't render mobile layout on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  // Route-specific mobile components
  const getMobileComponent = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return <MobileDashboard />;
      case '/community':
        return (
          <div className="min-h-screen pt-16 pb-20">
            {children}
          </div>
        );
      case '/warrior-space':
        return <MobileWarriorSpace />;
      default:
        return (
          <div className="min-h-screen pt-16 pb-20">
            {children}
          </div>
        );
    }
  };

  // Routes that should hide the bottom navigation
  const hideBottomNav = [
    '/login',
    '/signup',
    '/sign-in',
    '/sign-up',
    '/onboarding'
  ];

  const shouldShowBottomNav = !hideBottomNav.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className="relative min-h-screen bg-background">
      {getMobileComponent()}
      
      {shouldShowBottomNav && <MobileBottomNavigation />}
    </div>
  );
};

export default MobileLayout;