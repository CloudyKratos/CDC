import { supabase } from "@/integrations/supabase/client";
import { EventData } from '../SupabaseService';

export interface EnhancedEventData extends EventData {
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
}

class CalendarEventService {
  async getEvents(): Promise<EnhancedEventData[]> {
    try {
      console.log('🔄 CalendarEventService: Fetching events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ CalendarEventService: Error fetching events:', error);
        return [];
      }

      console.log('✅ CalendarEventService: Events fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 CalendarEventService: Exception in getEvents:', error);
      return [];
    }
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    try {
      console.log('🔄 CalendarEventService: Starting event creation...');
      console.log('📝 CalendarEventService: Input data:', eventData);
      
      // Get current user with detailed logging
      console.log('🔍 CalendarEventService: Getting current user...');
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ CalendarEventService: User auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData.user) {
        console.error('❌ CalendarEventService: No user found');
        throw new Error('User not authenticated');
      }
      
      console.log('✅ CalendarEventService: User authenticated:', userData.user.id);

      // Validate required fields with detailed logging
      console.log('🔍 CalendarEventService: Validating required fields...');
      
      if (!eventData.title?.trim()) {
        console.error('❌ CalendarEventService: Missing title');
        throw new Error('Event title is required');
      }

      if (!eventData.start_time) {
        console.error('❌ CalendarEventService: Missing start_time');
        throw new Error('Start time is required');
      }

      if (!eventData.end_time) {
        console.error('❌ CalendarEventService: Missing end_time');
        throw new Error('End time is required');
      }

      console.log('✅ CalendarEventService: Basic validation passed');

      // Date processing and validation
      console.log('🔍 CalendarEventService: Processing dates...');
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();
      
      console.log('📅 CalendarEventService: Processed dates:', { startTime, endTime });

      // Validate date logic
      if (new Date(endTime) <= new Date(startTime)) {
        console.error('❌ CalendarEventService: Invalid date range');
        throw new Error('End time must be after start time');
      }

      // Check for past events (with grace period)
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      if (new Date(startTime) < fiveMinutesAgo) {
        console.error('❌ CalendarEventService: Event in the past');
        throw new Error('Cannot create events in the past');
      }

      // Validate duration
      const durationHours = (new Date(endTime).getTime() - new Date(startTime).getTime()) / (1000 * 60 * 60);
      if (durationHours > 8) {
        console.error('❌ CalendarEventService: Duration too long:', durationHours);
        throw new Error('Event duration cannot exceed 8 hours');
      }

      console.log('✅ CalendarEventService: Date validation passed');

      // Prepare clean event data
      console.log('🔍 CalendarEventService: Preparing event data...');
      const cleanEventData = {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        start_time: startTime,
        end_time: endTime,
        event_type: eventData.event_type || 'mission_call',
        status: eventData.status || 'scheduled',
        visibility_level: eventData.visibility_level || 'public',
        xp_reward: Math.min(Math.max(eventData.xp_reward || 10, 0), 100),
        max_attendees: eventData.max_attendees && eventData.max_attendees > 0 ? eventData.max_attendees : null,
        is_recurring: eventData.is_recurring || false,
        tags: Array.isArray(eventData.tags) ? eventData.tags.filter(tag => tag.trim()) : [],
        meeting_url: eventData.meeting_url?.trim() || '',
        created_by: userData.user.id,
        workspace_id: null // Keep as null to avoid workspace issues
      };

      console.log('📋 CalendarEventService: Final event data:', cleanEventData);

      // Attempt database insertion
      console.log('🔍 CalendarEventService: Inserting into database...');
      const { data, error } = await supabase
        .from('events')
        .insert(cleanEventData)
        .select()
        .single();

      if (error) {
        console.error('❌ CalendarEventService: Database insertion error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        console.error('❌ CalendarEventService: No data returned from insertion');
        throw new Error('No data returned from database');
      }

      console.log('✅ CalendarEventService: Event created successfully:', data);
      return data;
      
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
        const startTime = new Date(updates.start_time);
        const endTime = new Date(updates.end_time);
        
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
        
        const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        if (durationHours > 8) {
          throw new Error('Event duration cannot exceed 8 hours');
        }
      }

      // Clean the updates data
      const cleanUpdates = {
        ...updates,
        title: updates.title?.trim(),
        description: updates.description?.trim(),
        meeting_url: updates.meeting_url?.trim(),
        tags: Array.isArray(updates.tags) ? updates.tags.filter(tag => tag.trim()) : updates.tags,
        xp_reward: updates.xp_reward ? Math.min(Math.max(updates.xp_reward, 0), 100) : updates.xp_reward
      };

      const { data, error } = await supabase
        .from('events')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        throw error;
      }

      console.log('Event updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      console.log('Deleting event:', id);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calendar event:', error);
        throw error;
      }

      console.log('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }

  async updateEventStatus(eventId: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<boolean> {
    try {
      const updates: any = { status };
      
      if (status === 'live') {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'completed') {
        updates.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId);

      if (error) {
        console.error('Error updating event status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating event status:', error);
      return false;
    }
  }

  async checkForOverlappingEvents(startTime: string, endTime: string, excludeEventId?: string): Promise<EnhancedEventData[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .or(`and(start_time.lte.${endTime},end_time.gte.${startTime})`);

      if (excludeEventId) {
        query = query.neq('id', excludeEventId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking for overlapping events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in checkForOverlappingEvents:', error);
      return [];
    }
  }
}

export default new CalendarEventService();
