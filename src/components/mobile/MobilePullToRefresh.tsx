import React, { useState, useCallback, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobilePullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

const MobilePullToRefresh: React.FC<MobilePullToRefreshProps> = ({
  children,
  onRefresh,
  threshold = 70,
  className
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (isRefreshing || !containerRef.current) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    
    if (containerRef.current.scrollTop === 0 && deltaY > 0) {
      e.preventDefault();
      const distance = Math.min(deltaY * 0.5, threshold * 1.5);
      setPullDistance(distance);
    }
  }, [startY, threshold, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setStartY(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldTrigger = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-auto scrollable-y", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 flex items-center justify-center",
          "bg-background/90 backdrop-blur-sm border-b border-border",
          "transition-all duration-200 ease-out z-50",
          pullDistance > 0 || isRefreshing ? "opacity-100" : "opacity-0"
        )}
        style={{
          height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
          transform: `translateY(${pullDistance > 0 || isRefreshing ? 0 : -60}px)`
        }}
      >
        <div className="flex items-center gap-2 text-sm">
          <RefreshCw 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isRefreshing 
                ? "animate-spin text-primary" 
                : shouldTrigger 
                ? "text-primary scale-110" 
                : "text-muted-foreground"
            )}
            style={{
              transform: `rotate(${pullProgress * 180}deg)`
            }}
          />
          <span className={cn(
            "font-medium transition-colors duration-200",
            isRefreshing 
              ? "text-primary" 
              : shouldTrigger 
              ? "text-primary" 
              : "text-muted-foreground"
          )}>
            {isRefreshing 
              ? "Refreshing..." 
              : shouldTrigger 
              ? "Release to refresh" 
              : "Pull to refresh"
            }
          </span>
        </div>
      </div>

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: `translateY(${pullDistance}px)`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default MobilePullToRefresh;