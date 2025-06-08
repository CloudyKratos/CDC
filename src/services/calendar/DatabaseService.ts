import { supabase } from "@/integrations/supabase/client";
import { EnhancedEventData } from './CalendarEventService';

export class DatabaseService {
  static async getEvents(): Promise<EnhancedEventData[]> {
    try {
      console.log('🔄 DatabaseService: Fetching events using security definer function...');
      
      // First, try to get the current user to check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ DatabaseService: Auth error:', authError);
        throw new Error(`Authentication error: ${authError.message}`);
      }

      if (!user) {
        console.log('⚠️ DatabaseService: No authenticated user, returning empty array');
        return [];
      }

      // Use the new security definer function to avoid RLS infinite recursion
      const { data, error } = await supabase
        .rpc('get_user_events', { _user_id: user.id });

      if (error) {
        console.error('❌ DatabaseService: Error fetching events via RPC:', error);
        
        // Fallback to direct query without workspace filtering
        console.log('🔄 DatabaseService: Trying fallback direct query...');
        
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('events')
          .select(`
            id,
            title,
            description,
            start_time,
            end_time,
            event_type,
            status,
            max_attendees,
            is_recurring,
            recurrence_pattern,
            tags,
            cohort_id,
            coach_id,
            replay_url,
            meeting_url,
            resources,
            visibility_level,
            xp_reward,
            created_by,
            workspace_id,
            created_at,
            updated_at
          `)
          .eq('visibility_level', 'public')
          .order('start_time', { ascending: true })
          .limit(50);

        if (fallbackError) {
          console.error('❌ DatabaseService: Fallback also failed:', fallbackError);
          throw new Error(`Database error: ${fallbackError.message}`);
        }

        console.log('✅ DatabaseService: Fallback successful, events fetched:', fallbackData?.length || 0);
        return fallbackData || [];
      }

      console.log('✅ DatabaseService: Events fetched successfully via RPC:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 DatabaseService: Exception in getEvents:', error);
      throw error;
    }
  }

  static async insertEvent(eventData: any): Promise<EnhancedEventData> {
    try {
      console.log('🔍 DatabaseService: Inserting into database...');
      console.log('📋 DatabaseService: Data to insert:', eventData);
      
      // Get current user for created_by field
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required to create events');
      }

      // Ensure the created_by field is set
      const insertData = {
        ...eventData,
        created_by: user.id
      };

      // Direct insert without any complex queries
      const { data, error } = await supabase
        .from('events')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('❌ DatabaseService: Database insertion error:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
      }

      if (!data) {
        console.error('❌ DatabaseService: No data returned from insertion');
        throw new Error('No data returned from database');
      }

      console.log('✅ DatabaseService: Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 DatabaseService: Exception in insertEvent:', error);
      throw error;
    }
  }

  static async updateEvent(id: string, updates: any): Promise<EnhancedEventData> {
    try {
      console.log('🔄 DatabaseService: Updating event:', id);
      
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ DatabaseService: Error updating event:', error);
        throw new Error(`Failed to update event: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from update');
      }

      console.log('✅ DatabaseService: Event updated successfully:', data);
      return data;
    } catch (error) {
      console.error('💥 DatabaseService: Exception in updateEvent:', error);
      throw error;
    }
  }

  static async deleteEvent(id: string): Promise<boolean> {
    try {
      console.log('🗑️ DatabaseService: Deleting event:', id);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ DatabaseService: Error deleting event:', error);
        throw new Error(`Failed to delete event: ${error.message}`);
      }

      console.log('✅ DatabaseService: Event deleted successfully');
      return true;
    } catch (error) {
      console.error('💥 DatabaseService: Exception in deleteEvent:', error);
      throw error;
    }
  }

  static async updateEventStatus(eventId: string, status: 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<boolean> {
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
        console.error('❌ DatabaseService: Error updating event status:', error);
        return false;
      }

      console.log('✅ DatabaseService: Event status updated successfully');
      return true;
    } catch (error) {
      console.error('💥 DatabaseService: Exception in updateEventStatus:', error);
      return false;
    }
  }

  static async checkForOverlappingEvents(startTime: string, endTime: string, excludeEventId?: string): Promise<EnhancedEventData[]> {
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
        console.error('❌ DatabaseService: Error checking overlapping events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('💥 DatabaseService: Exception in checkForOverlappingEvents:', error);
      return [];
    }
  }
}
