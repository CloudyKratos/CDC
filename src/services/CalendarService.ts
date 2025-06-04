
import { supabase } from "@/integrations/supabase/client";
import { EventData } from './SupabaseService';

export interface EnhancedEventData extends EventData {
  event_type?: string;
  status?: string;
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

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
}

export interface EventComment {
  id: string;
  event_id: string;
  user_id: string;
  content: string;
  comment_type: string;
  parent_comment_id?: string;
  created_at: string;
  updated_at: string;
}

class CalendarService {
  async getEvents(): Promise<EnhancedEventData[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventsByWorkspaceId(workspaceId: string): Promise<EnhancedEventData[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getEventWithStats(eventId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_event_with_stats', { event_id_param: eventId });

      if (error) {
        console.error('Error fetching event with stats:', error);
        return null;
      }

      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching event with stats:', error);
      return null;
    }
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          event_type: eventData.event_type || 'mission_call',
          status: eventData.status || 'scheduled',
          visibility_level: eventData.visibility_level || 'public',
          xp_reward: eventData.xp_reward || 10
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async updateEvent(id: string, updates: Partial<EnhancedEventData>): Promise<EnhancedEventData | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      return null;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calendar event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      return false;
    }
  }

  // RSVP Management
  async createRSVP(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<EventRSVP | null> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert([{
          event_id: eventId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status
        }], {
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

  // Comment Management
  async createComment(eventId: string, content: string, commentType: string = 'general'): Promise<EventComment | null> {
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .insert([{
          event_id: eventId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content,
          comment_type: commentType
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  async getCommentsForEvent(eventId: string): Promise<EventComment[]> {
    try {
      const { data, error } = await supabase
        .from('event_comments')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  // Attendance Management
  async recordAttendance(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('event_attendance')
        .insert([{
          event_id: eventId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          joined_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error recording attendance:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error recording attendance:', error);
      return false;
    }
  }

  async endAttendance(eventId: string): Promise<boolean> {
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return false;

      const { data: attendance, error: fetchError } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .is('left_at', null)
        .single();

      if (fetchError || !attendance) {
        console.error('Error finding attendance record:', fetchError);
        return false;
      }

      const leftAt = new Date();
      const joinedAt = new Date(attendance.joined_at);
      const durationMinutes = Math.floor((leftAt.getTime() - joinedAt.getTime()) / (1000 * 60));

      const { error } = await supabase
        .from('event_attendance')
        .update({
          left_at: leftAt.toISOString(),
          duration_minutes: durationMinutes,
          xp_earned: Math.min(durationMinutes, 60) // Max 60 XP per event
        })
        .eq('id', attendance.id);

      if (error) {
        console.error('Error ending attendance:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error ending attendance:', error);
      return false;
    }
  }

  // Event Status Management
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

  // Cohort Management
  async getCohorts(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching cohorts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching cohorts:', error);
      return [];
    }
  }

  async createCohort(name: string, description?: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('cohorts')
        .insert([{
          name,
          description,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating cohort:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating cohort:', error);
      return null;
    }
  }
}

export default new CalendarService();
