
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CalendarEventData } from '@/types/calendar-events';
import { EnhancedEventData } from '@/types/supabase-extended';
import CalendarServiceCore from '@/services/calendar/CalendarServiceCore';

// Helper function to convert EnhancedEventData to CalendarEventData
const convertToCalendarEventData = (events: EnhancedEventData[]): CalendarEventData[] => {
  return events.map(event => ({
    ...event,
    status: (event.status as CalendarEventData['status']) || 'scheduled',
    event_type: (event.event_type as CalendarEventData['event_type']) || 'mission_call'
  }));
};

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadEvents = useCallback(async (showToast = false) => {
    console.log('📋 useCalendarEvents: Loading events');
    setIsLoading(true);
    setError(null);
    
    try {
      const enhancedEvents = await CalendarServiceCore.getEvents();
      const calendarEvents = convertToCalendarEventData(enhancedEvents);
      setEvents(calendarEvents);
      setLastRefresh(new Date());
      
      if (showToast) {
        toast.success(`Loaded ${calendarEvents.length} events`);
      }
      
      console.log(`✅ useCalendarEvents: Loaded ${calendarEvents.length} events`);
    } catch (error) {
      const errorMessage = 'An unexpected error occurred while loading events';
      setError(errorMessage);
      console.error('💥 useCalendarEvents: Unexpected error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshEvents = useCallback(() => {
    loadEvents(true);
  }, [loadEvents]);

  const addOptimisticEvent = useCallback((event: CalendarEventData) => {
    setEvents(prev => [...prev, { ...event, id: `temp-${Date.now()}` }]);
  }, []);

  const updateOptimisticEvent = useCallback((id: string, updates: Partial<CalendarEventData>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  }, []);

  const removeOptimisticEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return {
    events,
    isLoading,
    error,
    lastRefresh,
    loadEvents,
    refreshEvents,
    addOptimisticEvent,
    updateOptimisticEvent,
    removeOptimisticEvent
  };
};
