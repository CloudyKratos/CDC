
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRole } from '@/contexts/RoleContext';
import { Plus, Calendar as CalendarIcon, Settings, Users, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CalendarService from '@/services/CalendarService';
import { EventData } from '@/services/SupabaseService';
import { CalendarEventData } from '@/types/calendar-events';
import AdminEventManagement from './calendar/AdminEventManagement';
import EnhancedCommunityCalendar from './calendar/EnhancedCommunityCalendar';
import { CalendarEventErrorBoundary } from './calendar/CalendarEventErrorBoundary';
import { CalendarStatusIndicator } from './calendar/CalendarStatusIndicator';
import CalendarConnectionManager from './calendar/CalendarConnectionManager';

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView = false }) => {
  const { canManageCalendar, currentRole } = useRole();
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('📅 CalendarPanel: Loading events...');
      
      const eventsData = await CalendarService.getEvents();
      console.log('📅 CalendarPanel: Events loaded:', eventsData.length);
      
      setEvents(eventsData);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast.success(`Loaded ${eventsData.length} events`);
      }
      
      if (retryCount > 0) {
        toast.success('Calendar refreshed successfully');
        setRetryCount(0);
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error loading events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      
      if (showToast || retryCount === 0) {
        toast.error('Failed to load calendar events');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    loadEvents(true);
  };

  const handleCreateEvent = async (eventData: CalendarEventData): Promise<void> => {
    try {
      console.log('📅 CalendarPanel: Creating event:', eventData);
      // Convert CalendarEventData to EventData format for the service
      const eventPayload: EventData = {
        ...eventData,
        event_type: eventData.event_type as EventData['event_type'] // Ensure type compatibility
      };
      const createdEvent = await CalendarService.createEvent(eventPayload);
      
      if (createdEvent) {
        console.log('📅 CalendarPanel: Event created successfully');
        await loadEvents(true);
        toast.success('Event created successfully');
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: CalendarEventData): Promise<void> => {
    try {
      console.log('📅 CalendarPanel: Updating event:', id, eventData);
      // Convert CalendarEventData to Partial<EventData> format for the service
      const eventPayload: Partial<EventData> = {
        ...eventData,
        event_type: eventData.event_type as EventData['event_type'] // Ensure type compatibility
      };
      const updatedEvent = await CalendarService.updateEvent(id, eventPayload);
      
      if (updatedEvent) {
        console.log('📅 CalendarPanel: Event updated successfully');
        await loadEvents(true);
        toast.success('Event updated successfully');
      } else {
        throw new Error('Failed to update event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleDeleteEvent = async (id: string): Promise<void> => {
    try {
      console.log('📅 CalendarPanel: Deleting event:', id);
      const success = await CalendarService.deleteEvent(id);
      
      if (success) {
        console.log('📅 CalendarPanel: Event deleted successfully');
        await loadEvents(true);
        toast.success('Event deleted successfully');
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('📅 CalendarPanel: Error deleting event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const isAdmin = currentRole === 'admin' || canManageCalendar;

  if (isLoading && retryCount === 0) {
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

  if (error && !isLoading) {
    return (
      <CalendarEventErrorBoundary>
        <div className="space-y-4 p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Error</h3>
              <p className="text-gray-600 mb-4">Unable to load calendar events.</p>
              <div className="space-y-2">
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                {retryCount > 2 && (
                  <p className="text-sm text-gray-500">
                    Tried {retryCount} times. Please check your connection.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </CalendarEventErrorBoundary>
    );
  }

  return (
    <CalendarEventErrorBoundary>
      <CalendarConnectionManager onRetry={handleRetry}>
        {/* Enhanced Community Calendar is the default view */}
        {!isAdmin || !isAdminView ? (
          <EnhancedCommunityCalendar />
        ) : (
          <div className="space-y-6 p-6">
            {/* Admin Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Calendar Management</h2>
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
                    onClick={() => loadEvents(true)}
                    disabled={isLoading}
                    className="flex items-center gap-1"
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
              
              {/* Role Information */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-900 font-medium">Admin Access</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Loading State */}
            {isLoading && (
              <Alert className="border-blue-200 bg-blue-50">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Refreshing calendar events... (Attempt #{retryCount + 1})
                </AlertDescription>
              </Alert>
            )}

            {/* Admin Interface */}
            <Tabs defaultValue="manage" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manage" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Event Management
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Community View
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
                <EnhancedCommunityCalendar />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CalendarConnectionManager>
    </CalendarEventErrorBoundary>
  );
};

export default CalendarPanel;
