
import { supabase } from "@/integrations/supabase/client";

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
}

class CalendarRSVPService {
  async createRSVP(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<EventRSVP | null> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: userData.user.id,
          status
        }, {
          onConflict: 'event_id,user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating/updating RSVP:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating/updating RSVP:', error);
      return null;
    }
  }

  async getRSVPsForEvent(eventId: string): Promise<EventRSVP[]> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching RSVPs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching RSVPs:', error);
      return [];
    }
  }
}

export default new CalendarRSVPService();
