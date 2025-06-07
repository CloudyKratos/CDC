import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Clock, Users, MapPin, Calendar } from 'lucide-react';
import CalendarService from '@/services/CalendarService';
import { EventData } from '@/services/SupabaseService';
import { toast } from 'sonner';

interface CalendarEvent extends EventData {
  start: Date;
  end: Date;
}

const SimpleCalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await CalendarService.getEvents();
      const formattedEvents = eventsData.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.start, date));
  };

  const getEventTypeIcon = (type?: string) => {
    switch (type) {
      case 'mission_call': return '🎯';
      case 'reflection_hour': return '🤔';
      case 'wisdom_drop': return '💡';
      case 'tribe_meetup': return '👥';
      case 'office_hours': return '🏢';
      case 'accountability_circle': return '🔄';
      case 'solo_ritual': return '🧘';
      case 'workshop': return '🔧';
      case 'course_drop': return '📚';
      case 'challenge_sprint': return '⚡';
      case 'deep_work_day': return '⚡';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type?: string) => {
    switch (type) {
      case 'mission_call': return 'bg-blue-500';
      case 'reflection_hour': return 'bg-green-500';
      case 'wisdom_drop': return 'bg-yellow-500';
      case 'tribe_meetup': return 'bg-purple-500';
      case 'office_hours': return 'bg-red-500';
      case 'accountability_circle': return 'bg-cyan-500';
      case 'solo_ritual': return 'bg-lime-500';
      case 'workshop': return 'bg-orange-500';
      case 'course_drop': return 'bg-pink-500';
      case 'challenge_sprint': return 'bg-indigo-500';
      case 'deep_work_day': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(currentDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(currentDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                month={currentDate}
                onMonthChange={setCurrentDate}
                modifiers={{
                  hasEvents: (date) => getEventsForDate(date).length > 0
                }}
                modifiersStyles={{
                  hasEvents: {
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontWeight: 'bold'
                  }
                }}
                className="w-full"
              />
            </CardContent>
          </Card>
        </div>

        {/* Selected Date Events */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events on this date</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getEventTypeIcon(event.event_type)}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            {event.event_type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getEventTypeIcon(selectedEvent.event_type)}</span>
                <div>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">
                      {selectedEvent.event_type?.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {selectedEvent.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(selectedEvent.start, 'PPP')} • {format(selectedEvent.start, 'p')} - {format(selectedEvent.end, 'p')}
                  </span>
                </div>
                
                {selectedEvent.max_attendees && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Max {selectedEvent.max_attendees} attendees</span>
                  </div>
                )}
              </div>
              
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700 text-sm">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                {selectedEvent.meeting_url && (
                  <Button 
                    className="flex-1"
                    onClick={() => window.open(selectedEvent.meeting_url, '_blank')}
                  >
                    Join Event
                  </Button>
                )}
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SimpleCalendarView;
