
import { supabase } from "@/integrations/supabase/client";
import { EventData } from './SupabaseService';

export interface EnhancedEventData extends EventData {
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
      console.log('Fetching events...');
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      console.log('Events fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  }

  async createEvent(eventData: EnhancedEventData): Promise<EnhancedEventData | null> {
    try {
      console.log('Creating event with data:', eventData);
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        console.error('User not authenticated:', userError);
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!eventData.title?.trim()) {
        throw new Error('Event title is required');
      }

      if (!eventData.start_time) {
        throw new Error('Start time is required');
      }

      if (!eventData.end_time) {
        throw new Error('End time is required');
      }

      // Ensure dates are properly formatted
      const startTime = new Date(eventData.start_time).toISOString();
      const endTime = new Date(eventData.end_time).toISOString();

      if (new Date(endTime) <= new Date(startTime)) {
        throw new Error('End time must be after start time');
      }

      // Prepare clean event data
      const cleanEventData = {
        title: eventData.title.trim(),
        description: eventData.description?.trim() || '',
        start_time: startTime,
        end_time: endTime,
        event_type: eventData.event_type || 'mission_call',
        status: eventData.status || 'scheduled',
        visibility_level: eventData.visibility_level || 'public',
        xp_reward: eventData.xp_reward || 10,
        max_attendees: eventData.max_attendees || null,
        is_recurring: eventData.is_recurring || false,
        tags: eventData.tags || [],
        meeting_url: eventData.meeting_url?.trim() || '',
        created_by: userData.user.id
      };

      console.log('Prepared clean event data:', cleanEventData);

      const { data, error } = await supabase
        .from('events')
        .insert(cleanEventData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating event:', error);
        throw new Error(`Failed to create event: ${error.message}`);
      }

      console.log('Event created successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<EnhancedEventData>): Promise<EnhancedEventData | null> {
    try {
      console.log('Updating event:', id, updates);
      
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
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<boolean> {
    try {
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
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  }

  // RSVP Management
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

  // Comment Management
  async createComment(eventId: string, content: string, commentType: string = 'general'): Promise<EventComment | null> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: userData.user.id,
          content,
          comment_type: commentType
        })
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('event_attendance')
        .insert({
          event_id: eventId,
          user_id: userData.user.id,
          joined_at: new Date().toISOString()
        });

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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return false;

      const { data: attendance, error: fetchError } = await supabase
        .from('event_attendance')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userData.user.id)
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
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('cohorts')
        .insert({
          name,
          description,
          created_by: userData.user.id
        })
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
