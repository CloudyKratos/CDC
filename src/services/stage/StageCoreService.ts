
import { supabase } from "@/integrations/supabase/client";
import { ExtendedStage, ExtendedStageInsert, StageStatus } from "@/types/supabase-extended";

// Export types properly with 'export type'
export type { ExtendedStage, ExtendedStageInsert, StageStatus };

class StageCoreService {
  async getStages(): Promise<ExtendedStage[]> {
    console.log('Fetching all stages');
    
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stages:', error);
      throw new Error(`Failed to fetch stages: ${error.message}`);
    }

    return data || [];
  }

  async getStageById(stageId: string): Promise<ExtendedStage | null> {
    console.log('Fetching stage by ID:', stageId);
    
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('id', stageId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Stage not found
      }
      console.error('Error fetching stage:', error);
      throw new Error(`Failed to fetch stage: ${error.message}`);
    }

    return data;
  }

  async createStage(stageData: ExtendedStageInsert): Promise<ExtendedStage> {
    console.log('Creating new stage:', stageData);
    
    const { data, error } = await supabase
      .from('stages')
      .insert(stageData)
      .select()
      .single();

    if (error) {
      console.error('Error creating stage:', error);
      throw new Error(`Failed to create stage: ${error.message}`);
    }

    return data;
  }

  async updateStageStatus(stageId: string, status: StageStatus): Promise<boolean> {
    console.log('Updating stage status:', { stageId, status });
    
    const updates: any = { 
      status,
      updated_at: new Date().toISOString()
    };
    
    if (status === 'live') {
      updates.actual_start_time = new Date().toISOString();
      updates.is_active = true;
    } else if (status === 'ended') {
      updates.end_time = new Date().toISOString();
      updates.is_active = false;
    }

    const { error } = await supabase
      .from('stages')
      .update(updates)
      .eq('id', stageId);

    if (error) {
      console.error('Error updating stage status:', error);
      return false;
    }

    return true;
  }

  async deleteStage(stageId: string): Promise<boolean> {
    console.log('Deleting stage:', stageId);
    
    const { error } = await supabase
      .from('stages')
      .delete()
      .eq('id', stageId);

    if (error) {
      console.error('Error deleting stage:', error);
      return false;
    }

    return true;
  }
}

export default new StageCoreService();
