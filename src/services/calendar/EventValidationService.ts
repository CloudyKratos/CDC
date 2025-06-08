
import { CalendarEventData } from '@/types/calendar-events';

export class EventValidationService {
  static validateEventData(eventData: CalendarEventData): void {
    if (!eventData.title || eventData.title.trim() === '') {
      throw new Error('Event title is required');
    }

    if (!eventData.start_time) {
      throw new Error('Event start time is required');
    }

    if (!eventData.end_time) {
      throw new Error('Event end time is required');
    }
  }

  static validateDateLogic(startTime: string, endTime: string): void {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      throw new Error('Invalid start time format');
    }

    if (isNaN(end.getTime())) {
      throw new Error('Invalid end time format');
    }

    if (start >= end) {
      throw new Error('Start time must be before end time');
    }

    // Check if the event is not too far in the past
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (start < oneDayAgo) {
      throw new Error('Cannot create events more than 24 hours in the past');
    }
  }
}
