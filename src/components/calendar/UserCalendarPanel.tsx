
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar as CalendarIcon, Clock, Users, Tag, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CalendarService from '@/services/CalendarService';
import EnhancedCalendarEventForm from './EnhancedCalendarEventForm';
import { EventData } from '@/services/SupabaseService';
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

interface CalendarEvent extends EventData {
  start: Date;
  end: Date;
}

const UserCalendarPanel = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateEvent = async (eventData: EventData) => {
    try {
      setIsSubmitting(true);
      console.log('Creating event with data:', eventData);
      
      const createdEvent = await CalendarService.createEvent(eventData);
      if (createdEvent) {
        toast.success('Event created successfully');
        setIsCreateDialogOpen(false);
        await loadEvents();
      } else {
        toast.error('Failed to create event - no data returned');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (eventData: EventData) => {
    if (!selectedEvent?.id) return;
    
    try {
      setIsSubmitting(true);
      const updatedEvent = await CalendarService.updateEvent(selectedEvent.id, eventData);
      if (updatedEvent) {
        toast.success('Event updated successfully');
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
        await loadEvents();
      } else {
        toast.error('Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const success = await CalendarService.deleteEvent(eventId);
      if (success) {
        toast.success('Event deleted successfully');
        setSelectedEvent(null);
        await loadEvents();
      } else {
        toast.error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

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

    return {
      style: colors[event.event_type || 'mission_call']
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

  const startAccessor = (event: CalendarEvent) => event.start;
  const endAccessor = (event: CalendarEvent) => event.end;

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
          <p className="text-gray-600">Manage your events and schedule</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Controls */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map((viewType) => (
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

          {/* Create Event Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EnhancedCalendarEventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setIsCreateDialogOpen(false)}
                isLoading={isSubmitting}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor={startAccessor}
            endAccessor={endAccessor}
            style={{ height: 600 }}
            view={view}
            onView={setView}
            onSelectEvent={setSelectedEvent}
            eventPropGetter={eventStyleGetter}
            className="p-4"
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
                    <Badge variant="outline">
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
                  <span className="font-medium">Start:</span>
                  <p>{format(selectedEvent.start, 'PPP p')}</p>
                </div>
                <div>
                  <span className="font-medium">End:</span>
                  <p>{format(selectedEvent.end, 'PPP p')}</p>
                </div>
                {selectedEvent.max_attendees && (
                  <div>
                    <span className="font-medium">Max Attendees:</span>
                    <p>{selectedEvent.max_attendees}</p>
                  </div>
                )}
                <div>
                  <span className="font-medium">XP Reward:</span>
                  <p>{selectedEvent.xp_reward || 10}</p>
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
                  <span className="font-medium">Meeting URL:</span>
                  <a 
                    href={selectedEvent.meeting_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block mt-1"
                  >
                    {selectedEvent.meeting_url}
                  </a>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex gap-1 mt-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
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
                
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Event</DialogTitle>
                    </DialogHeader>
                    <EnhancedCalendarEventForm
                      event={selectedEvent}
                      onSubmit={handleUpdateEvent}
                      onCancel={() => setIsEditDialogOpen(false)}
                      isLoading={isSubmitting}
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      handleDeleteEvent(selectedEvent.id!);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserCalendarPanel;
