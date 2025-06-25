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
  created_by: string;
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

      return (data || []).map(event => ({
        ...event,
        created_by: event.created_by || '',
        event_type: event.event_type as EventData['event_type']
      })) as EventData[];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async createCalendarEvent(eventData: EventData): Promise<EventData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return null;
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          created_by: user.id,
          workspace_id: eventData.workspace_id,
          event_type: eventData.event_type || 'mission_call',
          status: eventData.status || 'scheduled',
          max_attendees: eventData.max_attendees,
          is_recurring: eventData.is_recurring || false,
          recurrence_pattern: eventData.recurrence_pattern,
          tags: eventData.tags,
          cohort_id: eventData.cohort_id,
          coach_id: eventData.coach_id,
          replay_url: eventData.replay_url,
          meeting_url: eventData.meeting_url,
          resources: eventData.resources,
          visibility_level: eventData.visibility_level || 'public',
          xp_reward: eventData.xp_reward || 10
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating calendar event:', error);
        return null;
      }

      return {
        ...data,
        created_by: data.created_by || '',
        event_type: data.event_type as EventData['event_type']
      } as EventData;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return null;
    }
  }

  async updateCalendarEvent(id: string, updates: Partial<EventData>): Promise<EventData | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update({
          title: updates.title,
          description: updates.description,
          start_time: updates.start_time,
          end_time: updates.end_time,
          event_type: updates.event_type,
          status: updates.status,
          max_attendees: updates.max_attendees,
          is_recurring: updates.is_recurring,
          recurrence_pattern: updates.recurrence_pattern,
          tags: updates.tags,
          cohort_id: updates.cohort_id,
          coach_id: updates.coach_id,
          replay_url: updates.replay_url,
          meeting_url: updates.meeting_url,
          resources: updates.resources,
          visibility_level: updates.visibility_level,
          xp_reward: updates.xp_reward,
          workspace_id: updates.workspace_id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating calendar event:', error);
        return null;
      }

      return {
        ...data,
        created_by: data.created_by || '',
        event_type: data.event_type as EventData['event_type']
      } as EventData;
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

      return (data || []).map(event => ({
        ...event,
        created_by: event.created_by || '',
        event_type: event.event_type as EventData['event_type']
      })) as EventData[];
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
}

export default new SupabaseService();
