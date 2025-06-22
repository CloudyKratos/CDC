
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { CalendarEventData } from '@/types/calendar-events';

export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEventData[];
  hasEvents: boolean;
}

export const getEventTypeConfig = (type: string = 'event') => {
  const configs = {
    mission_call: { icon: '🎯', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50' },
    reflection_hour: { icon: '🤔', color: 'bg-green-500', textColor: 'text-green-700', bgColor: 'bg-green-50' },
    wisdom_drop: { icon: '💡', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgColor: 'bg-yellow-50' },
    tribe_meetup: { icon: '👥', color: 'bg-purple-500', textColor: 'text-purple-700', bgColor: 'bg-purple-50' },
    office_hours: { icon: '🏢', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50' },
    accountability_circle: { icon: '🔄', color: 'bg-cyan-500', textColor: 'text-cyan-700', bgColor: 'bg-cyan-50' },
    solo_ritual: { icon: '🧘', color: 'bg-lime-500', textColor: 'text-lime-700', bgColor: 'bg-lime-50' },
    workshop: { icon: '🔧', color: 'bg-orange-500', textColor: 'text-orange-700', bgColor: 'bg-orange-50' },
    course_drop: { icon: '📚', color: 'bg-pink-500', textColor: 'text-pink-700', bgColor: 'bg-pink-50' },
    challenge_sprint: { icon: '⚡', color: 'bg-indigo-500', textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' },
    deep_work_day: { icon: '💪', color: 'bg-gray-500', textColor: 'text-gray-700', bgColor: 'bg-gray-50' }
  };
  
  return configs[type as keyof typeof configs] || configs.mission_call;
};

export const getStatusConfig = (status: string = 'scheduled') => {
  const configs = {
    scheduled: { badge: 'default', text: 'Scheduled', color: 'text-gray-600' },
    live: { badge: 'destructive', text: 'Live Now', color: 'text-red-600' },
    completed: { badge: 'secondary', text: 'Completed', color: 'text-green-600' },
    cancelled: { badge: 'outline', text: 'Cancelled', color: 'text-gray-400' }
  };
  
  return configs[status as keyof typeof configs] || configs.scheduled;
};

export const generateCalendarDays = (
  currentDate: Date,
  selectedDate: Date | undefined,
  events: CalendarEventData[]
): CalendarDay[] => {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return days.map(date => {
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );

    return {
      date,
      dayOfMonth: date.getDate(),
      isCurrentMonth: isSameMonth(date, currentDate),
      isToday: isToday(date),
      isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
      events: dayEvents,
      hasEvents: dayEvents.length > 0
    };
  });
};

export const formatEventTime = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isSameDay(start, end)) {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  } else {
    return `${format(start, 'MMM d, h:mm a')} - ${format(end, 'MMM d, h:mm a')}`;
  }
};

export const getEventsForDate = (date: Date, events: CalendarEventData[]): CalendarEventData[] => {
  return events.filter(event => isSameDay(new Date(event.start_time), date));
};
