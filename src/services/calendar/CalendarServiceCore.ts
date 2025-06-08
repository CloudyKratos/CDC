
import { CalendarEventData, CalendarServiceResponse } from '@/types/calendar-events';
import { DatabaseService } from './DatabaseService';
import { EventValidationService } from './EventValidationService';
import { EventDataProcessor } from './EventDataProcessor';
import { AuthService } from './AuthService';

export class CalendarServiceCore {
  static async getEvents(): Promise<CalendarServiceResponse<CalendarEventData[]>> {
    try {
      console.log('🔄 CalendarServiceCore: Starting event fetch...');
      
      const events = await DatabaseService.getEvents();
      
      return {
        success: true,
        data: events
      };
    } catch (error) {
      console.error('💥 CalendarServiceCore: Error in getEvents:', error);
      
      // Handle specific RLS/policy errors
      if (error instanceof Error) {
        if (error.message.includes('infinite recursion') || 
            error.message.includes('policy') ||
            error.message.includes('workspace_members')) {
          return {
            success: false,
            error: 'Database permissions issue. Please check your workspace access.',
            code: 'RLS_ERROR'
          };
        }
        
        if (error.message.includes('Authentication')) {
          return {
            success: false,
            error: 'Please log in to access calendar events.',
            code: 'AUTH_ERROR'
          };
        }
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'UNKNOWN_ERROR'
      };
    }
  }

  static async createEvent(eventData: CalendarEventData): Promise<CalendarServiceResponse<CalendarEventData>> {
    try {
      console.log('🔄 CalendarServiceCore: Starting event creation...');
      
      // Get current user
      const userId = await AuthService.getCurrentUser();
      
      // Validate required fields
      EventValidationService.validateEventData(eventData);
      
      // Date processing and validation
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();
      
      EventValidationService.validateDateLogic(startTime, endTime);
      
      // Prepare clean event data
      const cleanEventData = EventDataProcessor.processEventData(eventData, userId);
      
      // Insert into database
      const result = await DatabaseService.insertEvent(cleanEventData);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('💥 CalendarServiceCore: Error in createEvent:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event',
        code: 'CREATE_ERROR'
      };
    }
  }

  static async updateEvent(id: string, updates: Partial<CalendarEventData>): Promise<CalendarServiceResponse<CalendarEventData>> {
    try {
      console.log('🔄 CalendarServiceCore: Starting event update...');
      
      // Validate updates if they include time changes
      if (updates.start_time && updates.end_time) {
        EventValidationService.validateDateLogic(updates.start_time, updates.end_time);
      }

      // Clean the updates data
      const cleanUpdates = EventDataProcessor.processUpdateData(updates);

      const result = await DatabaseService.updateEvent(id, cleanUpdates);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('💥 CalendarServiceCore: Error in updateEvent:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event',
        code: 'UPDATE_ERROR'
      };
    }
  }

  static async deleteEvent(id: string): Promise<CalendarServiceResponse<boolean>> {
    try {
      console.log('🔄 CalendarServiceCore: Starting event deletion...');
      
      const success = await DatabaseService.deleteEvent(id);
      
      return {
        success: true,
        data: success
      };
    } catch (error) {
      console.error('💥 CalendarServiceCore: Error in deleteEvent:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event',
        code: 'DELETE_ERROR'
      };
    }
  }
}
