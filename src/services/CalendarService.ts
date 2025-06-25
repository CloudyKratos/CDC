
import { supabase } from "@/integrations/supabase/client";
import SupabaseService, { EventData } from "./SupabaseService";
import CalendarAttendanceService from "./calendar/CalendarAttendanceService";

class CalendarService {
  // Event management
  async createEvent(eventData: EventData): Promise<EventData | null> {
    return await SupabaseService.createEvent(eventData);
  }

  async updateEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    return await SupabaseService.updateEvent(id, updates);
  }

  async deleteEvent(id: string): Promise<boolean> {
    return await SupabaseService.deleteEvent(id);
  }

  async getEvents(): Promise<EventData[]> {
    return await SupabaseService.getEvents();
  }

  async getEventById(id: string): Promise<EventData | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        return null;
      }

      return {
        ...data,
        created_by: data.created_by || '',
        event_type: data.event_type as EventData['event_type']
      } as EventData;
    } catch (error) {
      console.error('Error in getEventById:', error);
      return null;
    }
  }

  // Attendance management (simplified without non-existent tables)
  async recordAttendance(eventId: string, userId: string): Promise<boolean> {
    try {
      console.log('Recording attendance for event:', eventId, 'user:', userId);
      // Simplified implementation without event_attendance table
      return true;
    } catch (error) {
      console.error('Error recording attendance:', error);
      return false;
    }
  }

  async endAttendance(eventId: string, userId: string): Promise<boolean> {
    try {
      console.log('Ending attendance for event:', eventId, 'user:', userId);
      // Simplified implementation without event_attendance table
      return true;
    } catch (error) {
      console.error('Error ending attendance:', error);
      return false;
    }
  }

  // RSVP management (simplified)
  async rsvpToEvent(eventId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log('RSVP to event:', eventId, 'by user:', user.id);
      // Simplified implementation
      return true;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      return false;
    }
  }

  async cancelRSVP(eventId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log('Cancelling RSVP for event:', eventId, 'by user:', user.id);
      // Simplified implementation
      return true;
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      return false;
    }
  }

  // User's events
  async getUserEvents(userId: string): Promise<EventData[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', userId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching user events:', error);
        return [];
      }

      return (data || []).map(event => ({
        ...event,
        created_by: event.created_by || '',
        event_type: event.event_type as EventData['event_type']
      })) as EventData[];
    } catch (error) {
      console.error('Error in getUserEvents:', error);
      return [];
    }
  }

  // Event statistics
  async getEventStats(eventId: string): Promise<any> {
    try {
      console.log('Getting event stats for:', eventId);
      // Simplified implementation
      return {
        attendees: 0,
        rsvps: 0,
        comments: 0
      };
    } catch (error) {
      console.error('Error getting event stats:', error);
      return null;
    }
  }
}

export default new CalendarService();
