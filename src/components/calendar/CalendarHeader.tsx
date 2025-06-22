
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Filter, RefreshCw } from 'lucide-react';
import { CalendarViewState } from '@/hooks/useCalendarState';

interface CalendarHeaderProps {
  state: CalendarViewState;
  monthTitle: string;
  eventCount: number;
  isLoading?: boolean;
  onNavigateMonth: (direction: 'prev' | 'next') => void;
  onViewChange: (view: CalendarViewState['view']) => void;
  onRefresh: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  state,
  monthTitle,
  eventCount,
  isLoading = false,
  onNavigateMonth,
  onViewChange,
  onRefresh
}) => {
  const viewOptions: Array<{ key: CalendarViewState['view']; label: string }> = [
    { key: 'month', label: 'Month' },
    { key: 'week', label: 'Week' },
    { key: 'day', label: 'Day' },
    { key: 'agenda', label: 'Agenda' }
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      {/* Navigation and Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('prev')}
            disabled={isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold min-w-[180px] text-center">
            {monthTitle}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateMonth('next')}
            disabled={isLoading}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {eventCount} events
        </Badge>
      </div>

      {/* View Controls */}
      <div className="flex items-center gap-2">
        {/* View Selector */}
        <div className="flex bg-muted rounded-lg p-1">
          {viewOptions.map(({ key, label }) => (
            <Button
              key={key}
              variant={state.view === key ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(key)}
              className="text-xs"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
