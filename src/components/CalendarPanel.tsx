import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRole } from '@/contexts/RoleContext';
import RoleBasedComponent from '@/components/auth/RoleBasedComponent';
import { Plus, Calendar as CalendarIcon, Clock, Users, Tag, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CalendarService from '@/services/CalendarService';
import EnhancedCalendarEventForm from './calendar/EnhancedCalendarEventForm';
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

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView = false }) => {
  const { canManageCalendar, currentRole } = useRole();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      console.log('Loading events...');
      const eventsData = await CalendarService.getEvents();
      console.log('Events loaded:', eventsData);
      const formattedEvents = eventsData.map(event => ({
        ...event,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
      }));
      setEvents(formattedEvents);
      toast.success(`Loaded ${formattedEvents.length} events`);
    } catch (error) {
      console.error('Error loading events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: EventData) => {
    try {
      console.log('Creating event:', eventData);
      const createdEvent = await CalendarService.createEvent(eventData);
      if (createdEvent) {
        toast.success('Event created successfully');
        setIsCreateDialogOpen(false);
        await loadEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    }
  };

  const handleUpdateEvent = async (eventData: EventData) => {
    if (!selectedEvent?.id) return;
    
    try {
      console.log('Updating event:', selectedEvent.id, eventData);
      const updatedEvent = await CalendarService.updateEvent(selectedEvent.id, eventData);
      if (updatedEvent) {
        toast.success('Event updated successfully');
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
        await loadEvents(); // Refresh events
      }
    } catch (error) {
      console.error('Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(errorMessage);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      console.log('Deleting event:', eventId);
      const success = await CalendarService.deleteEvent(eventId);
      if (success) {
        toast.success('Event deleted successfully');
        setSelectedEvent(null);
        loadEvents();
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

    const statusStyles = {
      live: { border: '3px solid #10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' },
      cancelled: { opacity: 0.5, textDecoration: 'line-through' },
      completed: { opacity: 0.8 }
    };

    return {
      style: {
        ...colors[event.event_type || 'mission_call'],
        ...statusStyles[event.status || 'scheduled']
      }
    };
  };

  const getTypeIcon = (type?: string) => {
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

  // Fixed accessor functions for react-big-calendar
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Calendar Management' : 'Community Calendar'}
          </h2>
          <p className="text-gray-600">
            {isAdminView ? 'Manage and organize community events' : 'Discover and view upcoming events'}
          </p>
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

          {/* Add Event Button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
              </DialogHeader>
              <EnhancedCalendarEventForm
                onSubmit={handleCreateEvent}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {isAdminView 
                    ? 'Admin calendar management interface' 
                    : canManageCalendar 
                      ? 'You have full calendar management access' 
                      : 'You can view calendar events'}
                </p>
                <div className="text-sm text-blue-600 flex items-center gap-2">
                  <span>Current role:</span>
                  <Badge className="capitalize">{currentRole}</Badge>
                </div>
              </div>
            </div>
            
            {(canManageCalendar || isAdminView) && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Import Events
                </Button>
                <Button variant="outline" size="sm">
                  Export Calendar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                <span className="text-2xl">{getTypeIcon(selectedEvent.event_type)}</span>
                <div>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {format(selectedEvent.start, 'PPP')} • {format(selectedEvent.start, 'p')} - {format(selectedEvent.end, 'p')}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEvent.description && (
                <p className="text-gray-700">{selectedEvent.description}</p>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {Math.round((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60))} minutes
                </div>
                
                {selectedEvent.max_attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Max {selectedEvent.max_attendees} attendees
                  </div>
                )}
              </div>

              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <div className="flex gap-1">
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
                    />
                  </DialogContent>
                </Dialog>
                
                <Button 
                  variant="outline"
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

export default CalendarPanel;
