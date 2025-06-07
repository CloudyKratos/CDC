import { CalendarServiceCore } from './CalendarServiceCore';
import { CalendarEventData, CalendarServiceResponse } from '@/types/calendar-events';
import { EventValidationService } from './EventValidationService';
import { EventDataProcessor } from './EventDataProcessor';
import { AuthService } from './AuthService';
import { DatabaseService } from './DatabaseService';

export interface EnhancedEventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type?: 'mission_call' | 'reflection_hour' | 'wisdom_drop' | 'tribe_meetup' | 'office_hours' | 'accountability_circle' | 'solo_ritual' | 'workshop' | 'course_drop' | 'challenge_sprint' | 'deep_work_day';
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  max_attendees?: number;
  is_recurring?: boolean;
  recurrence_pattern?: any;
  tags?: string[];
  cohort_id?: string;
  coach_id?: string;
  replay_url?: string;
  meeting_url?: string;
  resources?: any;
  visibility_level?: string;
  xp_reward?: number;
  created_by?: string;
  workspace_id?: string;
}

class CalendarEventService {
  async getEvents(): Promise<EnhancedEventData[]> {
    return DatabaseService.getEvents();
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    try {
      console.log('🔄 CalendarEventService: Starting event creation...');
      console.log('📝 CalendarEventService: Input data:', eventData);
      
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
      
      console.log('✅ CalendarEventService: Event created successfully:', result);
      return result;
      
    } catch (error) {
      console.error('💥 CalendarEventService: Exception in createEvent:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<EnhancedEventData>): Promise<EnhancedEventData | null> {
    try {
      console.log('Updating event:', id, updates);
      
      // Validate updates if they include time changes
      if (updates.start_time && updates.end_time) {
        EventValidationService.validateDateLogic(updates.start_time, updates.end_time);
      }

      // Clean the updates data
      const cleanUpdates = EventDataProcessor.processUpdateData(updates);

      const result = await DatabaseService.updateEvent(id, cleanUpdates);
      return result;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      return await DatabaseService.deleteEvent(id);
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<boolean> {
    return DatabaseService.updateEventStatus(eventId, status);
  }

  async checkForOverlappingEvents(startTime: string, endTime: string, excludeEventId?: string): Promise<EnhancedEventData[]> {
    return DatabaseService.checkForOverlappingEvents(startTime, endTime, excludeEventId);
  }
}

export default new CalendarEventService();
