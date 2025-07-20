
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MobileOptimizedCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
  compact?: boolean;
}

const MobileOptimizedCard = ({ 
  title, 
  children, 
  className, 
  headerAction,
  compact = false 
}: MobileOptimizedCardProps) => {
  return (
    <Card className={cn(
      "w-full transition-all duration-200",
      compact ? "p-3 md:p-4" : "p-4 md:p-6",
      className
    )}>
      {title && (
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0",
          compact ? "pb-2" : "pb-4"
        )}>
          <CardTitle className={cn(
            "font-semibold text-gray-900 dark:text-white",
            compact ? "text-sm md:text-base" : "text-base md:text-lg"
          )}>
            {title}
          </CardTitle>
          {headerAction}
        </CardHeader>
      )}
      <CardContent className={cn(
        compact ? "p-0" : "pt-0"
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

export default MobileOptimizedCard;
