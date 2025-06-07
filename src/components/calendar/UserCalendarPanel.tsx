import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import RobustCalendarEventForm from './RobustCalendarEventForm';
import CalendarLoadingState from './CalendarLoadingState';
import CalendarErrorState from './CalendarErrorState';
import { CalendarEventErrorBoundary } from './CalendarEventErrorBoundary';
import { CalendarStatusIndicator } from './CalendarStatusIndicator';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarOperations } from '@/hooks/useCalendarOperations';
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

const UserCalendarPanel = () => {
  const { 
    events, 
    isLoading, 
    error, 
    lastRefresh, 
    refreshEvents,
    addOptimisticEvent,
    updateOptimisticEvent,
    removeOptimisticEvent
  } = useCalendarEvents();
  
  const { createEvent, updateEvent, deleteEvent } = useCalendarOperations();
  
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Format events for react-big-calendar
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    ...event,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
  }));

  const handleCreateEvent = async (eventData: CalendarEventData) => {
    console.log('🎯 UserCalendarPanel: Creating event');
    
    // Optimistic update
    addOptimisticEvent(eventData);
    
    try {
      const success = await createEvent(eventData);
      if (success) {
        setIsCreateDialogOpen(false);
        refreshEvents(); // Refresh to get the real data
      } else {
        // Remove optimistic update on failure
        removeOptimisticEvent(`temp-${Date.now()}`);
      }
    } catch (error) {
      console.error('💥 UserCalendarPanel: Create failed:', error);
      removeOptimisticEvent(`temp-${Date.now()}`);
    }
  };

  const handleUpdateEvent = async (eventData: CalendarEventData) => {
    if (!selectedEvent?.id) return;
    
    console.log('🔄 UserCalendarPanel: Updating event');
    
    // Optimistic update
    updateOptimisticEvent(selectedEvent.id, eventData);
    
    try {
      const success = await updateEvent(selectedEvent.id, eventData);
      if (success) {
        setIsEditDialogOpen(false);
        setSelectedEvent(null);
        refreshEvents(); // Refresh to get the real data
      } else {
        // Revert optimistic update on failure
        refreshEvents();
      }
    } catch (error) {
      console.error('💥 UserCalendarPanel: Update failed:', error);
      refreshEvents(); // Revert optimistic update
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log('🗑️ UserCalendarPanel: Deleting event');
    
    // Optimistic update
    removeOptimisticEvent(eventId);
    
    try {
      const success = await deleteEvent(eventId);
      if (success) {
        setSelectedEvent(null);
        refreshEvents(); // Refresh to confirm deletion
      } else {
        // Revert optimistic update on failure
        refreshEvents();
      }
    } catch (error) {
      console.error('💥 UserCalendarPanel: Delete failed:', error);
      refreshEvents(); // Revert optimistic update
    }
  };

  // ... keep existing code (eventStyleGetter, getEventTypeIcon, accessors)
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
    return <CalendarLoadingState />;
  }

  if (error) {
    return <CalendarErrorState error={error} onRetry={refreshEvents} />;
  }

  return (
    <CalendarEventErrorBoundary>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">My Calendar</h2>
            <div className="flex items-center gap-4 mt-2">
              <CalendarStatusIndicator
                isOnline={!error}
                lastSync={lastRefresh}
                hasErrors={!!error}
                isLoading={isLoading}
                eventCount={events.length}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshEvents}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
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
                <RobustCalendarEventForm
                  onSubmit={handleCreateEvent}
                  onCancel={() => setIsCreateDialogOpen(false)}
                  autoSave={true}
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
              events={calendarEvents}
              startAccessor={startAccessor}
              endAccessor={endAccessor}
              style={{ height: 600 }}
              view={view}
              onView={setView}
              onSelectEvent={setSelectedEvent}
              eventPropGetter={eventStyleGetter}
              className="p-4"
              messages={{
                noEventsInRange: 'No events in this time range. Create your first event!',
                showMore: (total) => `+${total} more`,
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
                      <RobustCalendarEventForm
                        event={selectedEvent}
                        onSubmit={handleUpdateEvent}
                        onCancel={() => setIsEditDialogOpen(false)}
                        autoSave={true}
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
    </CalendarEventErrorBoundary>
  );
};

export default UserCalendarPanel;
