
import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Clock, Users, Tag, MapPin, Video } from 'lucide-react';
import { CalendarEventData } from '@/types/calendar-events';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent extends CalendarEventData {
  start: Date;
  end: Date;
}

interface EnhancedCalendarViewProps {
  events: CalendarEventData[];
  onEventSelect?: (event: CalendarEventData) => void;
  showAllEvents?: boolean;
}

const EnhancedCalendarView: React.FC<EnhancedCalendarViewProps> = ({
  events,
  onEventSelect,
  showAllEvents = true
}) => {
  const [view, setView] = useState<View>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Format events for react-big-calendar
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    ...event,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
  }));

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      mission_call: { backgroundColor: '#3B82F6', color: 'white' },
      reflection_hour: { backgroundColor: '#10B981', color: 'white' },
      wisdom_drop: { backgroundColor: '#F59E0B', color: 'white' },
      tribe_meetup: { backgroundColor: '#8B5CF6', color: 'white' },
      office_hours: { backgroundColor: '#EF4444', color: 'white' },
      accountability_circle: { backgroundColor: '#06B6D4', color: 'white' },
      solo_ritual: { backgroundColor: '#84CC16', color: 'white' },
      workshop: { backgroundColor: '#F97316', color: 'white' },
      course_drop: { backgroundColor: '#EC4899', color: 'white' },
      challenge_sprint: { backgroundColor: '#6366F1', color: 'white' },
      deep_work_day: { backgroundColor: '#6B7280', color: 'white' }
    };

    const statusStyles = {
      live: { border: '3px solid #10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' },
      cancelled: { opacity: 0.5, textDecoration: 'line-through' },
      completed: { opacity: 0.8 }
    };

    return {
      style: {
        ...colors[event.event_type || 'mission_call'],
        ...statusStyles[event.status || 'scheduled'],
        borderRadius: '4px',
        border: 'none',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
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

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const startAccessor = (event: CalendarEvent) => event.start;
  const endAccessor = (event: CalendarEvent) => event.end;

  return (
    <div className="space-y-4">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['month', 'week', 'day', 'agenda'] as const).map((viewType) => (
            <Button
              key={viewType}
              variant={view === viewType ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView(viewType)}
              className="capitalize"
            >
              {viewType}
            </Button>
          ))}
        </div>

        <div className="text-sm text-gray-600">
          {events.length} event{events.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor={startAccessor}
            endAccessor={endAccessor}
            style={{ height: 600 }}
            view={view}
            onView={setView}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            className="p-4"
            messages={{
              noEventsInRange: 'No events in this time range.',
              showMore: (total) => `+${total} more`,
              today: 'Today',
              previous: '‹',
              next: '›',
              month: 'Month',
              week: 'Week',
              day: 'Day',
              agenda: 'Agenda'
            }}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) => 
                `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`,
              agendaTimeFormat: 'HH:mm',
              agendaDateFormat: 'MMM dd',
            }}
          />
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getEventTypeIcon(selectedEvent.event_type)}</span>
                <div>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedEvent.event_type?.replace('_', ' ')}
                    </Badge>
                    <Badge variant={selectedEvent.status === 'live' ? 'default' : 'secondary'}>
                      {selectedEvent.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedEvent.visibility_level}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Start:
                  </span>
                  <p className="mt-1">{format(selectedEvent.start, 'PPP p')}</p>
                </div>
                <div>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    End:
                  </span>
                  <p className="mt-1">{format(selectedEvent.end, 'PPP p')}</p>
                </div>
                {selectedEvent.max_attendees && (
                  <div>
                    <span className="font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Max Attendees:
                    </span>
                    <p className="mt-1">{selectedEvent.max_attendees}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">XP Reward:</span>
                  <p className="mt-1">{selectedEvent.xp_reward || 10} XP</p>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-700 mt-1">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.meeting_url && (
                <div>
                  <span className="font-medium flex items-center gap-1">
                    <Video className="h-4 w-4" />
                    Meeting:
                  </span>
                  <a 
                    href={selectedEvent.meeting_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <span className="font-medium flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    Tags:
                  </span>
                  <div className="flex gap-1 mt-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.meeting_url && (
                <div className="pt-4">
                  <Button 
                    className="w-full"
                    onClick={() => window.open(selectedEvent.meeting_url, '_blank')}
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Join Event
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedCalendarView;
