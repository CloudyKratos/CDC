
import { CalendarEvent } from '@/types/workspace';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';

// Helper function to determine event type color
export const getEventTypeColor = (type: string) => {
  switch (type) {
    case 'meeting':
      return 'bg-blue-500';
    case 'task':
      return 'bg-purple-500';
    case 'reminder':
      return 'bg-yellow-500';
    case 'event':
      return 'bg-green-500';
    case 'webinar':
      return 'bg-indigo-500';
    case 'deadline':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

// Get calendar cells for a given month
export const getCalendarCells = (currentDate: Date) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  return days.map((date) => ({
    date,
    dayOfMonth: date.getDate(),
    isCurrentMonth: isSameMonth(date, currentDate),
    isToday: isToday(date),
    events: [],
  }));
};

// Add events to calendar cells
export const addEventsToCalendar = (cells: any[], events: CalendarEvent[]) => {
  return cells.map((cell) => {
    const cellEvents = events.filter((event) => {
      const eventDate = event.date instanceof Date 
        ? event.date 
        : new Date(event.date);
      return isSameDay(cell.date, eventDate);
    });
    
    return {
      ...cell,
      events: cellEvents,
    };
  });
};

// Filter events based on current view, filters, and search term
export const filterEvents = (
  events: CalendarEvent[],
  currentDate: Date,
  filters: Record<string, boolean>,
  searchTerm: string
) => {
  return events.filter((event) => {
    // Check event type filter
    if (!filters[event.type]) {
      return false;
    }
    
    // Check search term
    if (
      searchTerm &&
      !event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !(event.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }
    
    return true;
  });
};

// Group events by date
export const groupEventsByDate = (events: CalendarEvent[]) => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  events.forEach((event) => {
    const dateKey = format(
      event.date instanceof Date ? event.date : new Date(event.date), 
      'yyyy-MM-dd'
    );
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(event);
  });
  
  return grouped;
};
