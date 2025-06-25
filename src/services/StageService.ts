
import { supabase } from '@/integrations/supabase/client';

interface Stage {
  id: string;
  name: string;
  description?: string;
  host_id: string;
  is_active: boolean;
  max_participants: number;
  workspace_id?: string;
  created_at: string;
  updated_at: string;
}

class StageService {
  async getActiveStages(): Promise<Stage[]> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stages:', error);
      throw error;
    }
  }

  async createStage(stageData: {
    name: string;
    description?: string;
    max_participants: number;
    is_active: boolean;
    host_id: string;
  }): Promise<Stage> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .insert(stageData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating stage:', error);
      throw error;
    }
  }

  async updateStage(id: string, updates: Partial<Stage>): Promise<Stage> {
    try {
      const { data, error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating stage:', error);
      throw error;
    }
  }

  async deleteStage(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('stages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting stage:', error);
      throw error;
    }
  }
}

export default new StageService();
