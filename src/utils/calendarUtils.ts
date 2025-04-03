
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay, addDays, parseISO, isThisMonth } from "date-fns";

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date | string;
  type: "meeting" | "task" | "reminder" | "event" | "webinar" | "deadline";
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  attendees?: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  isComplete?: boolean;
  category?: string;
  color?: string;
  priority?: "low" | "medium" | "high";
  organizer?: {
    id: string;
    name: string;
    avatar?: string;
  };
  recurrence?: {
    type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[];
  };
  url?: string;
  reminder?: {
    time: number;
    unit: "minutes" | "hours" | "days";
  };
}

/**
 * Gets the cells for a monthly calendar view
 * @param date The current month date
 * @returns An array of day objects for the calendar
 */
export const getCalendarCells = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = monthStart;
  
  // Get all days in the month
  const daysInMonth = eachDayOfInterval({
    start: startDate,
    end: monthEnd
  });
  
  // Create day objects for the calendar
  const days = daysInMonth.map(day => ({
    date: day,
    isToday: isToday(day),
    isCurrentMonth: isSameMonth(day, date),
    dayOfMonth: format(day, 'd'),
    dayOfWeek: format(day, 'EEE'),
    formattedDate: format(day, 'yyyy-MM-dd'),
    events: []
  }));
  
  // Get the day of the week of the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfMonth = getDay(monthStart);
  
  // If the month doesn't start on Sunday, add days from the previous month
  const previousMonthDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const previousDay = addDays(monthStart, -i - 1);
    previousMonthDays.push({
      date: previousDay,
      isToday: isToday(previousDay),
      isCurrentMonth: false,
      dayOfMonth: format(previousDay, 'd'),
      dayOfWeek: format(previousDay, 'EEE'),
      formattedDate: format(previousDay, 'yyyy-MM-dd'),
      events: []
    });
  }
  
  // Calculate how many days we need to add from the next month to fill the calendar (6 rows of 7 days)
  const totalDaysInCalendar = 42; // 6 rows * 7 days
  const daysToAdd = totalDaysInCalendar - (days.length + previousMonthDays.length);
  
  // Add days from the next month
  const nextMonthDays = [];
  for (let i = 1; i <= daysToAdd; i++) {
    const nextDay = addDays(monthEnd, i);
    nextMonthDays.push({
      date: nextDay,
      isToday: isToday(nextDay),
      isCurrentMonth: false,
      dayOfMonth: format(nextDay, 'd'),
      dayOfWeek: format(nextDay, 'EEE'),
      formattedDate: format(nextDay, 'yyyy-MM-dd'),
      events: []
    });
  }
  
  // Combine all days
  return [...previousMonthDays, ...days, ...nextMonthDays];
};

/**
 * Adds events to calendar cells
 * @param cells Calendar day cells
 * @param events Events to add to the calendar
 * @returns Calendar cells with events included
 */
export const addEventsToCalendar = (cells: any[], events: CalendarEvent[]) => {
  return cells.map(cell => {
    const cellEvents = events.filter(event => {
      const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
      return isSameDay(cell.date, eventDate);
    });
    
    return {
      ...cell,
      events: cellEvents
    };
  });
};

/**
 * Filters events by date range, type, or keyword
 * @param events All events
 * @param date Current date for filtering 
 * @param filters Active filters
 * @param searchTerm Search term for filtering
 * @returns Filtered events
 */
export const filterEvents = (
  events: CalendarEvent[],
  date: Date,
  filters: { [key: string]: boolean },
  searchTerm: string = ''
) => {
  const lowercasedSearch = searchTerm.toLowerCase();
  
  return events.filter(event => {
    const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
    
    // Filter by month if we're showing a monthly calendar
    const isInCurrentMonth = isThisMonth(eventDate) || isSameMonth(eventDate, date);
    
    // Filter by event type
    const typeFilter = Object.keys(filters).length === 0 || filters[event.type];
    
    // Filter by search term if provided
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(lowercasedSearch) || 
      (event.description && event.description.toLowerCase().includes(lowercasedSearch));
    
    return isInCurrentMonth && typeFilter && matchesSearch;
  });
};

/**
 * Groups events by date
 * @param events Events to group
 * @returns Events grouped by date
 */
export const groupEventsByDate = (events: CalendarEvent[]) => {
  const grouped: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    const eventDate = typeof event.date === 'string' ? parseISO(event.date) : event.date;
    const dateKey = format(eventDate, 'yyyy-MM-dd');
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(event);
  });
  
  return grouped;
};

/**
 * Gets color for event based on type or custom color
 */
export const getEventTypeColor = (type: string, customColor?: string) => {
  if (customColor) return customColor;
  
  switch (type) {
    case 'meeting':
      return 'bg-blue-500 border-blue-600';
    case 'task':
      return 'bg-purple-500 border-purple-600';
    case 'reminder':
      return 'bg-yellow-500 border-yellow-600';
    case 'event':
      return 'bg-green-500 border-green-600';
    case 'webinar':
      return 'bg-indigo-500 border-indigo-600';
    case 'deadline':
      return 'bg-red-500 border-red-600';
    default:
      return 'bg-gray-500 border-gray-600';
  }
};

export const getEventTypeIcon = (type: string) => {
  switch (type) {
    case 'meeting':
      return 'users';
    case 'task':
      return 'check-circle';
    case 'reminder':
      return 'bell';
    case 'event':
      return 'calendar';
    case 'webinar':
      return 'video';
    case 'deadline':
      return 'clock';
    default:
      return 'calendar';
  }
};
