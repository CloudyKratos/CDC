
import { useState, useCallback, useMemo } from 'react';
import { addMonths, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { CalendarEventData } from '@/types/calendar-events';

export interface CalendarViewState {
  currentDate: Date;
  selectedDate: Date | undefined;
  view: 'month' | 'week' | 'day' | 'agenda';
  showWeekends: boolean;
  eventFilters: {
    eventTypes: Set<string>;
    statuses: Set<string>;
    showAllDay: boolean;
  };
}

export const useCalendarState = (initialEvents: CalendarEventData[] = []) => {
  const [state, setState] = useState<CalendarViewState>({
    currentDate: new Date(),
    selectedDate: new Date(),
    view: 'month',
    showWeekends: true,
    eventFilters: {
      eventTypes: new Set(['mission_call', 'reflection_hour', 'wisdom_drop', 'tribe_meetup', 'office_hours', 'accountability_circle', 'solo_ritual', 'workshop', 'course_drop', 'challenge_sprint', 'deep_work_day']),
      statuses: new Set(['scheduled', 'live', 'completed']),
      showAllDay: true
    }
  });

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setState(prev => ({
      ...prev,
      currentDate: direction === 'next' 
        ? addMonths(prev.currentDate, 1)
        : subMonths(prev.currentDate, 1)
    }));
  }, []);

  const setView = useCallback((view: CalendarViewState['view']) => {
    setState(prev => ({ ...prev, view }));
  }, []);

  const setSelectedDate = useCallback((date: Date | undefined) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  const toggleEventType = useCallback((eventType: string) => {
    setState(prev => ({
      ...prev,
      eventFilters: {
        ...prev.eventFilters,
        eventTypes: new Set(
          prev.eventFilters.eventTypes.has(eventType)
            ? [...prev.eventFilters.eventTypes].filter(t => t !== eventType)
            : [...prev.eventFilters.eventTypes, eventType]
        )
      }
    }));
  }, []);

  const toggleStatus = useCallback((status: string) => {
    setState(prev => ({
      ...prev,
      eventFilters: {
        ...prev.eventFilters,
        statuses: new Set(
          prev.eventFilters.statuses.has(status)
            ? [...prev.eventFilters.statuses].filter(s => s !== status)
            : [...prev.eventFilters.statuses, status]
        )
      }
    }));
  }, []);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter(event => {
      const matchesType = !event.event_type || state.eventFilters.eventTypes.has(event.event_type);
      const matchesStatus = !event.status || state.eventFilters.statuses.has(event.status);
      return matchesType && matchesStatus;
    });
  }, [initialEvents, state.eventFilters]);

  const monthRange = useMemo(() => ({
    start: startOfMonth(state.currentDate),
    end: endOfMonth(state.currentDate),
    title: format(state.currentDate, 'MMMM yyyy')
  }), [state.currentDate]);

  return {
    state,
    actions: {
      navigateMonth,
      setView,
      setSelectedDate,
      toggleEventType,
      toggleStatus
    },
    computed: {
      filteredEvents,
      monthRange
    }
  };
};
