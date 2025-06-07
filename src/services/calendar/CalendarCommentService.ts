
import { supabase } from "@/integrations/supabase/client";

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

class CalendarCommentService {
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
}

export default new CalendarCommentService();
