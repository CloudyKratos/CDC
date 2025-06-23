
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ChevronLeft, ChevronRight, Search, Filter, Users, Clock, MapPin, Video, Star } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';
import { CalendarEventData } from '@/types/calendar-events';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { getEventTypeConfig, getStatusConfig, formatEventTime } from '@/utils/calendarHelpers';
import EventDetailsModal from './EventDetailsModal';

const CommunityCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');

  const { events, isLoading, error, refreshEvents } = useCalendarEvents();

  // Filter events based on search and type filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.size === 0 || 
      (event.event_type && selectedTypes.has(event.event_type));
    
    return matchesSearch && matchesType;
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd }).map(date => {
      const dayEvents = filteredEvents.filter(event => 
        isSameDay(new Date(event.start_time), date)
      );

      return {
        date,
        dayOfMonth: date.getDate(),
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        events: dayEvents,
        hasEvents: dayEvents.length > 0
      };
    });
  };

  const calendarDays = generateCalendarDays();

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.start_time) > new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5);

  const liveEvents = filteredEvents.filter(event => event.status === 'live');

  const handleJoinEvent = (event: CalendarEventData) => {
    if (event.meeting_url) {
      window.open(event.meeting_url, '_blank');
      toast.success('Opening event meeting...');
    } else {
      toast.error('No meeting link available for this event');
    }
  };

  const toggleEventType = (type: string) => {
    const newTypes = new Set(selectedTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    setSelectedTypes(newTypes);
  };

  const eventTypes = [
    'mission_call', 'reflection_hour', 'wisdom_drop', 'tribe_meetup', 
    'office_hours', 'accountability_circle', 'solo_ritual', 'workshop', 
    'course_drop', 'challenge_sprint', 'deep_work_day'
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading community calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Community Calendar
        </h1>
        <p className="text-lg text-muted-foreground">
          Stay connected with all community events and activities
        </p>
      </div>

      {/* Live Events Banner */}
      {liveEvents.length > 0 && (
        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  <span className="font-semibold">LIVE NOW</span>
                </div>
                <span className="text-white/90">
                  {liveEvents.length} event{liveEvents.length !== 1 ? 's' : ''} happening now
                </span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedEvent(liveEvents[0])}
              >
                Join Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-wrap gap-1">
                {eventTypes.slice(0, 4).map(type => {
                  const config = getEventTypeConfig(type);
                  const isSelected = selectedTypes.has(type);
                  return (
                    <Button
                      key={type}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleEventType(type)}
                      className="text-xs"
                    >
                      {config.icon} {type.replace('_', ' ')}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Calendar Interface */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all hover:bg-muted/50
                      ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/20'}
                      ${day.isToday ? 'ring-2 ring-primary' : ''}
                      ${day.isSelected ? 'bg-primary/10' : ''}
                    `}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <div className={`text-sm font-medium ${
                      day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                    } ${day.isToday ? 'text-primary font-bold' : ''}`}>
                      {day.dayOfMonth}
                    </div>
                    
                    <div className="space-y-1 mt-1">
                      {day.events.slice(0, 2).map((event, eventIndex) => {
                        const config = getEventTypeConfig(event.event_type);
                        return (
                          <div
                            key={eventIndex}
                            className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${config.bgColor} ${config.textColor}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                          >
                            {config.icon} {event.title}
                          </div>
                        );
                      })}
                      {day.events.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{day.events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map(event => {
                    const config = getEventTypeConfig(event.event_type);
                    return (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{config.icon}</span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{event.title}</h4>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(event.start_time), 'MMM d, h:mm a')}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.event_type?.replace('_', ' ')}
                              </Badge>
                              {event.max_attendees && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="h-3 w-3" />
                                  {event.max_attendees}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Events</span>
                  <span className="font-bold">{events.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-bold">
                    {events.filter(e => isSameMonth(new Date(e.start_time), new Date())).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Live Now</span>
                  <span className="font-bold text-red-500">{liveEvents.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Upcoming</span>
                  <span className="font-bold text-green-500">{upcomingEvents.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onJoinEvent={handleJoinEvent}
      />
    </div>
  );
};

export default CommunityCalendarView;
