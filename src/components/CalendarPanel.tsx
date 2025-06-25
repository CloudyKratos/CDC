
import React, { useState, useEffect } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { toast } from 'sonner';
import { CalendarEventData } from '@/types/calendar-events';
import { CalendarEventErrorBoundary } from './calendar/CalendarEventErrorBoundary';
import CalendarConnectionManager from './calendar/CalendarConnectionManager';
import EnhancedCommunityCalendar from './calendar/EnhancedCommunityCalendar';
import { CalendarPanelHeader } from './calendar/CalendarPanelHeader';
import { CalendarPanelLoadingState } from './calendar/CalendarPanelLoadingState';
import { CalendarPanelErrorState } from './calendar/CalendarPanelErrorState';
import { CalendarPanelAdminTabs } from './calendar/CalendarPanelAdminTabs';
import { CalendarPanelService } from './calendar/CalendarPanelService';

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
      
      const calendarEvents = await CalendarPanelService.loadEvents();
      setEvents(calendarEvents);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast.success(`Loaded ${calendarEvents.length} events`);
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
      await CalendarPanelService.createEvent(eventData);
      await loadEvents(true);
    } catch (error) {
      console.error('📅 CalendarPanel: Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleUpdateEvent = async (id: string, eventData: CalendarEventData): Promise<void> => {
    try {
      await CalendarPanelService.updateEvent(id, eventData);
      await loadEvents(true);
    } catch (error) {
      console.error('📅 CalendarPanel: Error updating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update event';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const handleDeleteEvent = async (id: string): Promise<void> => {
    try {
      await CalendarPanelService.deleteEvent(id);
      await loadEvents(true);
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
        <CalendarPanelLoadingState />
      </CalendarEventErrorBoundary>
    );
  }

  if (error && !isLoading) {
    return (
      <CalendarEventErrorBoundary>
        <CalendarPanelErrorState
          error={error}
          retryCount={retryCount}
          onRetry={handleRetry}
        />
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
            <CalendarPanelHeader
              isAdmin={isAdmin}
              error={error}
              lastRefresh={lastRefresh}
              isLoading={isLoading}
              eventCount={events.length}
              onRefresh={() => loadEvents(true)}
            />

            <CalendarPanelAdminTabs
              events={events}
              isLoading={isLoading}
              retryCount={retryCount}
              onCreateEvent={handleCreateEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
            />
          </div>
        )}
      </CalendarConnectionManager>
    </CalendarEventErrorBoundary>
  );
};

export default CalendarPanel;
