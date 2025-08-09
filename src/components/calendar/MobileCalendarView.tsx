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
    <div className="space-y-4 px-1">
      {/* Header with Navigation - Enhanced touch targets */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => actions.navigateMonth('prev')}
            className="touch-target h-11 w-11 transition-all hover:scale-105"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold min-w-[120px] sm:min-w-[140px] text-center px-2">
            {format(state.currentDate, 'MMM yyyy')}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => actions.navigateMonth('next')}
            className="touch-target h-11 w-11 transition-all hover:scale-105"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="touch-target h-11 w-11">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="touch-target h-11 w-11">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View Toggle - Improved mobile design */}
      <div className="flex bg-muted/30 rounded-xl p-1 backdrop-blur-sm">
        {viewButtons.map((view) => (
          <Button
            key={view.key}
            variant={selectedView === view.key ? "secondary" : "ghost"}
            className={cn(
              "flex-1 h-10 text-sm font-medium transition-all duration-200",
              selectedView === view.key 
                ? "bg-background shadow-md scale-[1.02]" 
                : "hover:bg-muted/50"
            )}
            onClick={() => setSelectedView(view.key as any)}
          >
            {view.label}
          </Button>
        ))}
      </div>

      {/* Quick Stats - Fluid responsive grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold text-primary">{todayEvents.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">Today</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold text-accent-foreground">{tomorrowEvents.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">Tomorrow</div>
          </CardContent>
        </Card>
        <Card className="text-center hover:shadow-md transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="text-lg sm:text-xl font-bold text-primary">{upcomingEvents.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground truncate">This Week</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Events - Enhanced mobile layout */}
      {todayEvents.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Today's Events
              <Badge variant="secondary" className="ml-auto text-xs">
                {todayEvents.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 sm:p-6">
            {todayEvents.slice(0, 3).map(event => {
              const config = getEventTypeConfig(event.event_type);
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/20 rounded-xl hover:bg-muted/40 transition-all duration-200">
                  <div className="flex-shrink-0 text-lg sm:text-xl">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base line-clamp-2">{event.title}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {format(new Date(event.start_time), 'h:mm a')}
                      </div>
                      <Badge variant="outline" className="text-xs px-2 py-0.5 w-fit">
                        {event.event_type?.replace('_', ' ').substring(0, 12)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
            {todayEvents.length > 3 && (
              <div className="text-center pt-2 border-t border-border/50">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm touch-target">
                  View {todayEvents.length - 3} more events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events - Enhanced mobile layout */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-muted/10 to-transparent">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            Upcoming Events
            <Badge variant="outline" className="ml-auto text-xs">
              {upcomingEvents.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm sm:text-base text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map(event => {
                const config = getEventTypeConfig(event.event_type);
                return (
                  <div key={event.id} className="flex items-start gap-3 p-3 border border-border/50 rounded-xl hover:bg-muted/20 hover:shadow-sm transition-all duration-200">
                    <div className="flex-shrink-0 text-lg sm:text-xl">{config.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base line-clamp-2">{event.title}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_time), 'MMM d • h:mm a')}
                        </p>
                        <Badge 
                          variant={event.status === 'live' ? 'default' : 'secondary'} 
                          className="text-xs w-fit"
                        >
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