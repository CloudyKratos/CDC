
import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const ResponsiveContainer = ({ 
  children, 
  className,
  maxWidth = 'full',
  padding = 'md'
}: ResponsiveContainerProps) => {
  const maxWidthClass = {
    'sm': 'max-w-sm',
    'md': 'max-w-md', 
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl',
    'full': 'max-w-full'
  }[maxWidth];

  const paddingClass = {
    'none': 'p-0',
    'sm': 'p-2 md:p-4',
    'md': 'p-4 md:p-6',
    'lg': 'p-6 md:p-8'
  }[padding];

  return (
    <div className={cn(
      'w-full mx-auto',
      maxWidthClass,
      paddingClass,
      className
    )}>
      {children}
    </div>
  );
};

export default ResponsiveContainer;
