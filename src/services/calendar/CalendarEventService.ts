
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
      console.log('Fetching events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      console.log('Events fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    try {
      console.log('Creating event with data:', eventData);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!eventData.title?.trim()) {
        throw new Error('Event title is required');
      }

      if (!eventData.start_time) {
        throw new Error('Start time is required');
      }

      if (!eventData.end_time) {
        throw new Error('End time is required');
      }

      // Ensure dates are properly formatted
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();

      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error('End time must be after start time');
      }

      // Prepare clean event data - only include fields that exist in the database
      const cleanEventData = {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        start_time: startTime,
        end_time: endTime,
        event_type: eventData.event_type || 'mission_call',
        status: eventData.status || 'scheduled',
        visibility_level: eventData.visibility_level || 'public',
        xp_reward: eventData.xp_reward || 10,
        max_attendees: eventData.max_attendees || null,
        is_recurring: eventData.is_recurring || false,
        tags: eventData.tags || [],
        meeting_url: eventData.meeting_url?.trim() || '',
        created_by: userData.user.id
      };

      console.log('Prepared clean event data:', cleanEventData);

      const { data, error } = await supabase
        .from('events')
        .insert(cleanEventData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating event:', error);
        throw new Error(`Failed to create event: ${error.message}`);
      }

      console.log('Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<EnhancedEventData>): Promise<EnhancedEventData | null> {
    try {
      console.log('Updating event:', id, updates);
      
      const { data, error } = await supabase
        .from('events')
        .update(updates)
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
}

export default new CalendarEventService();
