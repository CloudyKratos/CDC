
import { supabase } from "@/integrations/supabase/client";

class CalendarAttendanceService {
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
}

export default new CalendarAttendanceService();
