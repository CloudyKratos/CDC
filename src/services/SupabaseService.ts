
import { supabase } from "@/integrations/supabase/client";

// Event data type matching CalendarEventData structure
export interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  event_type?: 'mission_call' | 'workshop' | 'meeting' | 'social' | 'reflection_hour' | 'wisdom_drop' | 'tribe_meetup' | 'office_hours' | 'accountability_circle' | 'solo_ritual' | 'course_drop' | 'challenge_sprint' | 'deep_work_day';
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
  visibility_level?: 'public' | 'private' | 'restricted';
  xp_reward?: number;
  created_by?: string;
  workspace_id?: string;
}

export class SupabaseService {
  static async getEvents(): Promise<EventData[]> {
    try {
      console.log('🔄 SupabaseService: Fetching events...');
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ SupabaseService: Error fetching events:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ SupabaseService: Events fetched successfully:', data?.length || 0);
      
      // Transform database results to EventData with proper type assertions
      return (data || []).map(event => ({
        ...event,
        event_type: (event.event_type as EventData['event_type']) || 'mission_call',
        status: (event.status as EventData['status']) || 'scheduled',
        visibility_level: (event.visibility_level as EventData['visibility_level']) || 'public'
      }));
    } catch (error) {
      console.error('💥 SupabaseService: Exception in getEvents:', error);
      throw error;
    }
  }

  static async createEvent(eventData: EventData): Promise<EventData> {
    try {
      console.log('🔍 SupabaseService: Creating event...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required to create events');
      }

      const insertData = {
        ...eventData,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('events')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ SupabaseService: Error creating event:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ SupabaseService: Event created successfully:', data);
      return {
        ...data,
        event_type: (data.event_type as EventData['event_type']) || 'mission_call',
        status: (data.status as EventData['status']) || 'scheduled',
        visibility_level: (data.visibility_level as EventData['visibility_level']) || 'public'
      };
    } catch (error) {
      console.error('💥 SupabaseService: Exception in createEvent:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    try {
      console.log('🔄 SupabaseService: Updating event:', id);
      
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ SupabaseService: Error updating event:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        return null;
      }

      console.log('✅ SupabaseService: Event updated successfully:', data);
      return {
        ...data,
        event_type: (data.event_type as EventData['event_type']) || 'mission_call',
        status: (data.status as EventData['status']) || 'scheduled',
        visibility_level: (data.visibility_level as EventData['visibility_level']) || 'public'
      };
    } catch (error) {
      console.error('💥 SupabaseService: Exception in updateEvent:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string): Promise<boolean> {
    try {
      console.log('🗑️ SupabaseService: Deleting event:', id);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ SupabaseService: Error deleting event:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('✅ SupabaseService: Event deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 SupabaseService: Exception in deleteEvent:', error);
      return false;
    }
  }
}

export default SupabaseService;
