
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { CalendarEventData } from '@/types/calendar-events';
import { CalendarServiceCore } from '@/services/calendar/CalendarServiceCore';

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
      const response = await CalendarServiceCore.getEvents();
      
      if (response.success && response.data) {
        setEvents(response.data);
        setLastRefresh(new Date());
        
        if (showToast) {
          toast.success(`Loaded ${response.data.length} events`);
        }
        
        console.log(`✅ useCalendarEvents: Loaded ${response.data.length} events`);
      } else {
        const errorMessage = response.error || 'Failed to load events';
        setError(errorMessage);
        console.error('❌ useCalendarEvents: Load failed:', errorMessage);
      }
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
