
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const CalendarLoadingState = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Calendar skeleton */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Week days */}
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
              
              {/* Calendar dates */}
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-6 w-full" />
                  {Math.random() > 0.7 && (
                    <Skeleton className="h-4 w-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarLoadingState;
