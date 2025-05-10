
import { supabase } from "@/integrations/supabase/client";

interface MemberData {
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
}

class SupabaseService {
  async getWorkspaceMembers(workspaceId: string): Promise<MemberData[]> {
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

  async getEventsByWorkspaceId(workspaceId: string): Promise<EventData[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('workspace_id', workspaceId);

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
        .insert([eventData])
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
        .select('*');

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
}

export type MemberProfileData = {
  id: string;
  name: string;
  avatar: string;
};

export type CalendarEventData = {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  created_by?: string;
  workspace_id?: string;
};

export default new SupabaseService();
