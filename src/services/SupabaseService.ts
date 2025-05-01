import { supabase } from "@/integrations/supabase/client";

interface MemberData {
  id: string;
  name: string;
  avatar: string;
}

export interface EventData {
  id: string;
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
        const profile = member.profiles || {};
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
        .from('calendar_events')
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
        .from('calendar_events')
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
        .from('calendar_events')
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
        .from('calendar_events')
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
