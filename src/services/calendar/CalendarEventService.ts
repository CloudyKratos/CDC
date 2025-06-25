
import { EnhancedEventData } from '@/types/supabase-extended';
import { DatabaseService } from './DatabaseService';

// Define CalendarEventData to match EnhancedEventData
type CalendarEventData = EnhancedEventData;

class CalendarEventService {
  async getEvents(): Promise<CalendarEventData[]> {
    try {
      const events = await DatabaseService.getEvents();
      return events as CalendarEventData[];
    } catch (error) {
      console.error('Error in CalendarEventService.getEvents:', error);
      throw error;
    }
  }

  async createEvent(eventData: any): Promise<CalendarEventData> {
    try {
      const newEvent = await DatabaseService.insertEvent(eventData);
      return newEvent as CalendarEventData;
    } catch (error) {
      console.error('Error in CalendarEventService.createEvent:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: any): Promise<CalendarEventData> {
    try {
      const updatedEvent = await DatabaseService.updateEvent(id, updates);
      return updatedEvent as CalendarEventData;
    } catch (error) {
      console.error('Error in CalendarEventService.updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      return await DatabaseService.deleteEvent(id);
    } catch (error) {
      console.error('Error in CalendarEventService.deleteEvent:', error);
      throw error;
    }
  }

  async checkForOverlappingEvents(startTime: string, endTime: string, excludeEventId?: string): Promise<CalendarEventData[]> {
    try {
      const overlappingEvents = await DatabaseService.checkForOverlappingEvents(startTime, endTime, excludeEventId);
      return overlappingEvents as CalendarEventData[];
    } catch (error) {
      console.error('Error in CalendarEventService.checkForOverlappingEvents:', error);
      throw error;
    }
  }
}

export default new CalendarEventService();
