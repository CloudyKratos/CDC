import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Bell, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  onMenuClick?: () => void;
  className?: string;
  actions?: React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backPath = '/',
  onMenuClick,
  className,
  actions
}) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50",
      "bg-background/95 backdrop-blur-lg border-b border-border",
      "mobile-header",
      "lg:hidden", // Hide on desktop
      className
    )}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left section */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <Link to={backPath}>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target touch-feedback"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="touch-target touch-feedback"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )
          )}
          
          {/* Title section */}
          {title && (
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {actions}
          
          {/* Default actions if none provided */}
          {!actions && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="touch-target touch-feedback"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="touch-target touch-feedback relative"
              >
                <Bell className="h-5 w-5" />
                {/* Notification badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
              </Button>
              
              {user && (
                <Avatar className="h-8 w-8 ml-2">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Safe area padding */}
      <div className="h-safe-area-inset-top" />
    </header>
  );
};

export default MobileHeader;