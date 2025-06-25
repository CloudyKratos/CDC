
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, RefreshCw } from 'lucide-react';
import { CalendarStatusIndicator } from './CalendarStatusIndicator';

interface CalendarPanelHeaderProps {
  isAdmin: boolean;
  error: string | null;
  lastRefresh: Date;
  isLoading: boolean;
  eventCount: number;
  onRefresh: () => void;
}

export const CalendarPanelHeader: React.FC<CalendarPanelHeaderProps> = ({
  isAdmin,
  error,
  lastRefresh,
  isLoading,
  eventCount,
  onRefresh
}) => {
  if (!isAdmin) return null;

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Calendar Management</h2>
        <div className="flex items-center gap-4 mt-2">
          <CalendarStatusIndicator
            isOnline={!error}
            lastSync={lastRefresh}
            hasErrors={!!error}
            isLoading={isLoading}
            eventCount={eventCount}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-blue-900 font-medium">Admin Access</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
