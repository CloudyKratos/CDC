import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users,
  Plus,
  Filter
} from 'lucide-react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarState } from '@/hooks/useCalendarState';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { getEventTypeConfig } from '@/utils/calendarHelpers';
import { cn } from '@/lib/utils';

const MobileCalendarView: React.FC = () => {
  const { events, isLoading } = useCalendarEvents();
  const { state, actions } = useCalendarState(events);
  const [selectedView, setSelectedView] = useState<'day' | 'week' | 'month'>('day');

  // Calculate statistics
  const todayEvents = events.filter(event => isToday(new Date(event.start_time)));
  const tomorrowEvents = events.filter(event => isTomorrow(new Date(event.start_time)));
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const weekFromNow = addDays(new Date(), 7);
    return eventDate >= new Date() && eventDate <= weekFromNow;
  });

  const viewButtons = [
    { key: 'day', label: 'Day' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' }
  ];

  return (
    <div className="space-y-4">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => actions.navigateMonth('prev')}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[140px] text-center">
            {format(state.currentDate, 'MMMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => actions.navigateMonth('next')}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex bg-muted/50 rounded-lg p-1">
        {viewButtons.map((view) => (
          <Button
            key={view.key}
            variant={selectedView === view.key ? "secondary" : "ghost"}
            className={cn(
              "flex-1 h-8 text-sm",
              selectedView === view.key && "bg-background shadow-sm"
            )}
            onClick={() => setSelectedView(view.key as any)}
          >
            {view.label}
          </Button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-primary">{todayEvents.length}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-orange-500">{tomorrowEvents.length}</div>
            <div className="text-xs text-muted-foreground">Tomorrow</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-3">
            <div className="text-lg font-bold text-green-500">{upcomingEvents.length}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events */}
      {todayEvents.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4 text-primary" />
              Today's Events
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayEvents.slice(0, 3).map(event => {
              const config = getEventTypeConfig(event.event_type);
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="text-lg">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.start_time), 'h:mm a')}
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0">
                        {event.event_type?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {todayEvents.length > 3 && (
              <div className="text-center pt-2">
                <Button variant="ghost" size="sm" className="text-xs">
                  View {todayEvents.length - 3} more events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-orange-500" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map(event => {
                const config = getEventTypeConfig(event.event_type);
                return (
                  <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                    <div className="text-lg">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), 'MMM d • h:mm a')}
                        </p>
                        <Badge variant={event.status === 'live' ? 'default' : 'secondary'} className="text-xs">
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileCalendarView;