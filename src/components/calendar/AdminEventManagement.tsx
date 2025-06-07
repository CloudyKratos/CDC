
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Users, Clock, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';
import RobustCalendarEventForm from './RobustCalendarEventForm';
import { CalendarEventData } from '@/types/calendar-events';
import { format } from 'date-fns';

interface AdminEventManagementProps {
  events: CalendarEventData[];
  onCreateEvent: (eventData: CalendarEventData) => Promise<void>;
  onUpdateEvent: (id: string, eventData: CalendarEventData) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
  isLoading?: boolean;
}

const AdminEventManagement: React.FC<AdminEventManagementProps> = ({
  events,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent,
  isLoading = false
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const upcomingEvents = events.filter(event => 
    new Date(event.start_time) > new Date()
  ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const pastEvents = events.filter(event => 
    new Date(event.end_time) < new Date()
  ).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const liveEvents = events.filter(event => {
    const now = new Date();
    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    return start <= now && end >= now;
  });

  const handleCreateEvent = async (eventData: CalendarEventData) => {
    try {
      await onCreateEvent(eventData);
      setIsCreateDialogOpen(false);
      toast.success('Community event created successfully!');
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    }
  };

  const handleUpdateEvent = async (eventData: CalendarEventData) => {
    if (!selectedEvent?.id) return;
    
    try {
      await onUpdateEvent(selectedEvent.id, eventData);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      toast.success('Event updated successfully!');
    } catch (error) {
      console.error('Failed to update event:', error);
      toast.error('Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this community event?')) return;
    
    try {
      await onDeleteEvent(eventId);
      toast.success('Event deleted successfully!');
    } catch (error) {
      console.error('Failed to delete event:', error);
      toast.error('Failed to delete event');
    }
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

  const EventCard: React.FC<{ event: CalendarEventData }> = ({ event }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <span className="text-2xl">{getEventTypeIcon(event.event_type)}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {format(new Date(event.start_time), 'MMM d, HH:mm')}
                </div>
                {event.max_attendees && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Max {event.max_attendees}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="capitalize text-xs">
                  {event.event_type?.replace('_', ' ')}
                </Badge>
                <Badge variant={event.status === 'live' ? 'default' : 'secondary'} className="text-xs">
                  {event.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {event.visibility_level}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedEvent(event);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => event.id && handleDeleteEvent(event.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Community Event Management</h2>
          <p className="text-gray-600">Create and manage events for the community</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Community Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Community Event</DialogTitle>
            </DialogHeader>
            <RobustCalendarEventForm
              onSubmit={handleCreateEvent}
              onCancel={() => setIsCreateDialogOpen(false)}
              autoSave={true}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Live Now</p>
                <p className="text-2xl font-bold">{liveEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{pastEvents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Management Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
          <TabsTrigger value="live">Live ({liveEvents.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastEvents.length})</TabsTrigger>
          <TabsTrigger value="all">All Events</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Events</h3>
                <p className="text-gray-600 mb-4">Create your first community event to get started.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          {liveEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Live Events</h3>
                <p className="text-gray-600">No events are currently happening.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {liveEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Past Events</h3>
                <p className="text-gray-600">Past events will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pastEvents.slice(0, 20).map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="space-y-3">
            {events.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Event Dialog */}
      {selectedEvent && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Community Event</DialogTitle>
            </DialogHeader>
            <RobustCalendarEventForm
              event={selectedEvent}
              onSubmit={handleUpdateEvent}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedEvent(null);
              }}
              autoSave={true}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminEventManagement;
