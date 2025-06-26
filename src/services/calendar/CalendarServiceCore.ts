

import { EnhancedEventData } from '@/types/supabase-extended';
import CalendarEventService from './CalendarEventService';

// Use EnhancedEventData as the main type
type CalendarEventData = EnhancedEventData;

class CalendarServiceCore {
  async getEvents(): Promise<CalendarEventData[]> {
    try {
      const events = await CalendarEventService.getEvents();
      return events;
    } catch (error) {
      console.error('CalendarServiceCore: Error getting events:', error);
      throw error;
    }
  }

  async createEvent(eventData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    event_type?: string;
    visibility_level?: string;
    max_attendees?: number;
    tags?: string[];
    meeting_url?: string;
    resources?: any;
  }): Promise<CalendarEventData> {
    try {
      console.log('CalendarServiceCore: Creating event:', eventData);
      
      // Ensure required fields are present
      const eventToCreate = {
        ...eventData,
        created_by: 'system', // This will be overridden by DatabaseService
        visibility_level: eventData.visibility_level || 'public',
        event_type: eventData.event_type || 'mission_call',
        status: 'scheduled'
      };

      const newEvent = await CalendarEventService.createEvent(eventToCreate);
      console.log('CalendarServiceCore: Event created successfully:', newEvent);
      return newEvent;
    } catch (error) {
      console.error('CalendarServiceCore: Error creating event:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<CalendarEventData>): Promise<CalendarEventData> {
    try {
      console.log('CalendarServiceCore: Updating event:', { id, updates });
      
      const updatedEvent = await CalendarEventService.updateEvent(id, updates);
      console.log('CalendarServiceCore: Event updated successfully:', updatedEvent);
      return updatedEvent;
    } catch (error) {
      console.error('CalendarServiceCore: Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      console.log('CalendarServiceCore: Deleting event:', id);
      
      const success = await CalendarEventService.deleteEvent(id);
      console.log('CalendarServiceCore: Event deletion result:', success);
      return success;
    } catch (error) {
      console.error('CalendarServiceCore: Error deleting event:', error);
      throw error;
    }
  }

  async checkForOverlappingEvents(startTime: string, endTime: string, excludeEventId?: string): Promise<CalendarEventData[]> {
    try {
      return await CalendarEventService.checkForOverlappingEvents(startTime, endTime, excludeEventId);
    } catch (error) {
      console.error('CalendarServiceCore: Error checking overlapping events:', error);
      return [];
    }
  }
}

export default new CalendarServiceCore();
