import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backPath?: string;
  actions?: React.ReactNode;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backPath = '/',
  actions
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/30 mobile-safe-area-top">
      <div className="flex items-center justify-between px-4 py-3 min-h-[64px]">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {showBack && (
            <Link to={backPath}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="touch-target-optimal h-10 w-10 -ml-2 hover:bg-muted/50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
};

export default MobileHeader;