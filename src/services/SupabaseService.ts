import { supabase } from "@/integrations/supabase/client";

// Interface definitions
export interface MemberProfileData {
  id: string;
  name: string;
  avatar: string;
}

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by?: string;
  workspace_id?: string;
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

class SupabaseService {
  async getWorkspaceMembers(workspaceId: string): Promise<MemberProfileData[]> {
    try {
      const { data: members, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('workspace_id', workspaceId);

      if (error) {
        console.error('Error fetching workspace members:', error);
        return [];
      }

      return members.map(member => {
        // Safely access profile data with proper typing
        const profile = member.profiles as { id?: string; full_name?: string; avatar_url?: string } || {};
        return {
          id: profile.id || member.user_id || '',
          name: profile.full_name || 'Unknown User',
          avatar: profile.avatar_url || '',
        };
      });
    } catch (error) {
      console.error('Error in getWorkspaceMembers:', error);
      return [];
    }
  }

  // Enhanced event-related methods
  async getEventsByWorkspaceId(workspaceId: string): Promise<EventData[]> {
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

  async createCalendarEvent(eventData: EventData): Promise<EventData | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          event_type: eventData.event_type || 'mission_call',
          status: eventData.status || 'scheduled',
          visibility_level: eventData.visibility_level || 'public',
          xp_reward: eventData.xp_reward || 10
        })
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

  async updateCalendarEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
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

  async deleteCalendarEvent(id: string): Promise<boolean> {
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

  // Authentication methods
  async signUp(email: string, password: string, fullName: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        console.error('Error during signup:', error);
        throw error;
      }
      
      return data.user;
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        console.error('Error sending password reset email:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return false;
    }
  }

  async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        console.error('Error updating password:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return false;
    }
  }

  // Aliases for CalendarPanel compatibility
  async getEvents(): Promise<EventData[]> {
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

  async createEvent(eventData: EventData): Promise<EventData | null> {
    return this.createCalendarEvent(eventData);
  }

  async updateEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    return this.updateCalendarEvent(id, updates);
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.deleteCalendarEvent(id);
  }

  // Enhanced event methods for RSVP and attendance
  async createRSVP(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
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

  async getEventWithStats(eventId: string): Promise<any> {
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
}

export default new SupabaseService();
