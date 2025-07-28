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

    // Type assertion to handle the database return type
    return (data || []).map(stage => ({
      ...stage,
      status: stage.status as StageStatus,
      name: stage.name || stage.title // Fallback if name is missing
    })) as ExtendedStage[];
  }

  async getActiveStages(): Promise<ExtendedStage[]> {
    console.log('Fetching active stages');
    
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active stages:', error);
      throw new Error(`Failed to fetch active stages: ${error.message}`);
    }

    // Type assertion to handle the database return type
    return (data || []).map(stage => ({
      ...stage,
      status: stage.status as StageStatus,
      name: stage.name || stage.title // Fallback if name is missing
    })) as ExtendedStage[];
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

    // Type assertion to handle the database return type
    return {
      ...data,
      status: data.status as StageStatus,
      name: data.name || data.title // Fallback if name is missing
    } as ExtendedStage;
  }

  async createStage(stageData: ExtendedStageInsert): Promise<ExtendedStage> {
    console.log('Creating new stage:', stageData);
    
    // Ensure name field is included (use title as fallback)
    const stageWithName = {
      ...stageData,
      name: stageData.name || stageData.title
    };
    
    const { data, error } = await supabase
      .from('stages')
      .insert(stageWithName)
      .select()
      .single();

    if (error) {
      console.error('Error creating stage:', error);
      throw new Error(`Failed to create stage: ${error.message}`);
    }

    // Type assertion to handle the database return type
    return {
      ...data,
      status: data.status as StageStatus,
      name: data.name || data.title // Fallback if name is missing
    } as ExtendedStage;
  }

  async validateStageAccess(stageId: string): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      console.log('Validating stage access for:', stageId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { canAccess: false, reason: 'Authentication required' };
      }

      const stage = await this.getStageById(stageId);
      if (!stage) {
        return { canAccess: false, reason: 'Stage not found' };
      }

      // Basic access validation - can be extended with more complex rules
      return { canAccess: true };
    } catch (error) {
      console.error('Error validating stage access:', error);
      return { canAccess: false, reason: 'Access validation failed' };
    }
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
