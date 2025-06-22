
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDay, getEventTypeConfig, getStatusConfig } from '@/utils/calendarHelpers';
import { CalendarEventData } from '@/types/calendar-events';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
  days: CalendarDay[];
  onDateSelect: (date: Date) => void;
  onEventSelect: (event: CalendarEventData) => void;
  showWeekends?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  onDateSelect,
  onEventSelect,
  showWeekends = true
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const displayDays = showWeekends ? weekDays : weekDays.slice(1, 6);

  const filteredDays = showWeekends 
    ? days 
    : days.filter(day => {
        const dayOfWeek = day.date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6;
      });

  return (
    <Card>
      <CardContent className="p-4">
        {/* Week day headers */}
        <div className={`grid ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'} gap-1 mb-2`}>
          {displayDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className={`grid ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'} gap-1`}>
          {filteredDays.map((day, index) => (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 border rounded-lg transition-colors cursor-pointer",
                day.isCurrentMonth ? "bg-background" : "bg-muted/30",
                day.isToday && "ring-2 ring-primary",
                day.isSelected && "bg-primary/10 border-primary",
                "hover:bg-muted/50"
              )}
              onClick={() => onDateSelect(day.date)}
            >
              {/* Date number */}
              <div className="flex justify-between items-start mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  day.isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  day.isToday && "text-primary font-bold"
                )}>
                  {day.dayOfMonth}
                </span>
                {day.hasEvents && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {day.events.slice(0, 3).map((event, eventIndex) => {
                  const eventConfig = getEventTypeConfig(event.event_type);
                  const statusConfig = getStatusConfig(event.status);

                  return (
                    <Button
                      key={eventIndex}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full h-auto p-1 text-xs justify-start",
                        eventConfig.bgColor,
                        eventConfig.textColor,
                        "hover:opacity-80"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventSelect(event);
                      }}
                    >
                      <div className="flex items-center gap-1 truncate">
                        <span>{eventConfig.icon}</span>
                        <span className="truncate">{event.title}</span>
                        {event.status === 'live' && (
                          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    </Button>
                  );
                })}
                
                {day.events.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{day.events.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarGrid;
