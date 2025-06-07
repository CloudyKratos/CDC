
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/contexts/RoleContext';
import { Plus, Calendar as CalendarIcon, Settings, Users } from 'lucide-react';
import { toast } from 'sonner';
import CalendarService from '@/services/CalendarService';
import { EventData } from '@/services/SupabaseService';
import { CalendarEventData } from '@/types/calendar-events';
import AdminEventManagement from './calendar/AdminEventManagement';
import EnhancedCalendarView from './calendar/EnhancedCalendarView';
import { CalendarEventErrorBoundary } from './calendar/CalendarEventErrorBoundary';
import { CalendarStatusIndicator } from './calendar/CalendarStatusIndicator';

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView = false }) => {
  const { canManageCalendar, currentRole } = useRole();
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📅 CalendarPanel: Loading events...');
      
      const eventsData = await CalendarService.getEvents();
      console.log('📅 CalendarPanel: Events loaded:', eventsData.length);
      
      setEvents(eventsData);
      setLastRefresh(new Date());
      toast.success(`Loaded ${eventsData.length} events`);
    } catch (error) {
      console.error('📅 CalendarPanel: Error loading events:', error);
      setError('Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (eventData: CalendarEventData) => {
    try {
      console.log('📅 CalendarPanel: Creating event:', eventData);
      const createdEvent = await CalendarService.createEvent(eventData as EventData);
      
      if (createdEvent) {
        console.log('📅 CalendarPanel: Event created successfully');
        await loadEvents(); // Refresh events list
        return Promise.resolve();
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      throw new Error(errorMessage);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: CalendarEventData) => {
    try {
      console.log('📅 CalendarPanel: Updating event:', id, eventData);
      const updatedEvent = await CalendarService.updateEvent(id, eventData as Partial<EventData>);
      
      if (updatedEvent) {
        console.log('📅 CalendarPanel: Event updated successfully');
        await loadEvents(); // Refresh events list
        return Promise.resolve();
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      throw new Error(errorMessage);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      console.log('📅 CalendarPanel: Deleting event:', id);
      const success = await CalendarService.deleteEvent(id);
      
      if (success) {
        console.log('📅 CalendarPanel: Event deleted successfully');
        await loadEvents(); // Refresh events list
        return Promise.resolve();
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error deleting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      throw new Error(errorMessage);
    }
  };

  const isAdmin = currentRole === 'admin' || canManageCalendar;

  if (isLoading) {
    return (
      <CalendarEventErrorBoundary>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading calendar...</p>
          </div>
        </div>
      </CalendarEventErrorBoundary>
    );
  }

  if (error) {
    return (
      <CalendarEventErrorBoundary>
        <Card className="max-w-md mx-auto mt-8">
          <CardContent className="p-8 text-center">
            <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadEvents} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </CalendarEventErrorBoundary>
    );
  }

  return (
    <CalendarEventErrorBoundary>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isAdminView ? 'Admin Calendar Management' : 'Community Calendar'}
            </h2>
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
                onClick={loadEvents}
                className="flex items-center gap-1"
              >
                <CalendarIcon className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
          
          {/* Role Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900 font-medium">
                  {isAdmin ? 'Admin Access' : 'Community Member'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Interface */}
        {isAdmin ? (
          <Tabs defaultValue="manage" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Event Management
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage">
              <AdminEventManagement
                events={events}
                onCreateEvent={handleCreateEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="calendar">
              <EnhancedCalendarView
                events={events}
                showAllEvents={true}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <EnhancedCalendarView
            events={events}
            showAllEvents={true}
          />
        )}
      </div>
    </CalendarEventErrorBoundary>
  );
};

export default CalendarPanel;
