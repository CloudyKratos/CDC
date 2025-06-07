
import { supabase } from "@/integrations/supabase/client";
import { EnhancedEventData } from './CalendarEventService';

export class DatabaseService {
  static async getEvents(): Promise<EnhancedEventData[]> {
    try {
      console.log('🔄 DatabaseService: Fetching events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('❌ DatabaseService: Error fetching events:', error);
        return [];
      }

      console.log('✅ DatabaseService: Events fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('💥 DatabaseService: Exception in getEvents:', error);
      return [];
    }
  }

  static async insertEvent(eventData: any): Promise<EnhancedEventData> {
    console.log('🔍 DatabaseService: Inserting into database...');
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
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
  }

  static async updateEvent(id: string, updates: any): Promise<EnhancedEventData> {
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
  }

  static async deleteEvent(id: string): Promise<boolean> {
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
        console.error('Error updating event status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating event status:', error);
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
