
import { supabase } from "@/integrations/supabase/client";

class CalendarCohortService {
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

export default new CalendarCohortService();
