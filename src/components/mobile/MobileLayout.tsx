import React from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNavigation from './MobileBottomNavigation';
import ImprovedMobileDashboard from './ImprovedMobileDashboard';
import MobileCommandCenter from './MobileCommandCenter';

interface MobileLayoutProps {
  children: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Don't render mobile layout on desktop
  if (!isMobile) {
    return <>{children}</>;
  }

  // Route-specific mobile components
  const getMobileComponent = () => {
    switch (location.pathname) {
      case '/':
        return (
          <div className="min-h-screen pt-16 pb-20">
            {children}
          </div>
        );
      case '/dashboard':
        // Check if user is accessing command center specifically
        const activeTab = searchParams.get('tab');
        if (activeTab === 'command-room') {
          return <MobileCommandCenter />;
        }
        return <ImprovedMobileDashboard />;
      case '/community':
        return (
          <div className="min-h-screen pt-16 pb-20">
            {children}
          </div>
        );
      case '/warrior-space':
        // Use the desktop version for warrior space to keep all features
        return (
          <div className="min-h-screen pt-16 pb-20">
            {children}
          </div>
        );
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