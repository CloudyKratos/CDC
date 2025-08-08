import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  MoreVertical,
  Search,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileDashboardHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

const MobileDashboardHeader: React.FC<MobileDashboardHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBackClick,
  actions,
  className
}) => {
  const { user } = useAuth();

  return (
    <header className={cn(
      "mobile-header fixed top-0 left-0 right-0 z-40",
      "bg-background/95 backdrop-blur-lg border-b border-border",
      "mobile-safe-area-top lg:hidden",
      className
    )}>
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Left section */}
        <div className="flex items-center gap-3 flex-1">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              className="touch-target-optimal p-2 hover:bg-muted/50"
              onClick={onBackClick}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg truncate mobile-text-title">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {actions || (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="touch-target-optimal p-2 hover:bg-muted/50"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm" 
                className="touch-target-optimal p-2 hover:bg-muted/50 relative"
              >
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
              </Button>

              <Avatar className="h-8 w-8 touch-target-optimal">
                <AvatarFallback className="text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileDashboardHeader;