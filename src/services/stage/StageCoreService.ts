
import { supabase } from "@/integrations/supabase/client";
import { ExtendedStage, ExtendedStageInsert, StageStatus } from "@/types/supabase-extended";

export { StageStatus };

class StageCoreService {
  async createStage(stageData: ExtendedStageInsert): Promise<ExtendedStage> {
    console.log('Creating stage with data:', stageData);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be authenticated to create a stage');
    }

    // Ensure creator_id is set to current user
    const stageToCreate = {
      ...stageData,
      creator_id: user.id,
      host_id: user.id, // Also set host_id for backward compatibility
      name: stageData.title, // Map title to name for backward compatibility
    };

    const { data, error } = await supabase
      .from('stages')
      .insert(stageToCreate)
      .select()
      .single();

    if (error) {
      console.error('Error creating stage:', error);
      throw new Error(`Failed to create stage: ${error.message}`);
    }

    return data as ExtendedStage;
  }

  async getActiveStages(): Promise<ExtendedStage[]> {
    console.log('Fetching active stages');
    
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .in('status', ['scheduled', 'live'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active stages:', error);
      throw new Error(`Failed to fetch stages: ${error.message}`);
    }

    return (data || []) as ExtendedStage[];
  }

  async getStageById(stageId: string): Promise<ExtendedStage | null> {
    console.log('Fetching stage by ID:', stageId);
    
    const { data, error } = await supabase
      .from('stages')
      .select('*')
      .eq('id', stageId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching stage:', error);
      throw new Error(`Failed to fetch stage: ${error.message}`);
    }

    return data as ExtendedStage | null;
  }

  async updateStageStatus(stageId: string, status: StageStatus): Promise<boolean> {
    console.log('Updating stage status:', { stageId, status });
    
    const updateData: any = { status };
    
    // Set timestamps based on status
    if (status === 'live') {
      updateData.actual_start_time = new Date().toISOString();
      updateData.is_active = true;
    } else if (status === 'ended') {
      updateData.end_time = new Date().toISOString();
      updateData.is_active = false;
    }

    const { error } = await supabase
      .from('stages')
      .update(updateData)
      .eq('id', stageId);

    if (error) {
      console.error('Error updating stage status:', error);
      throw new Error(`Failed to update stage status: ${error.message}`);
    }

    return true;
  }

  async validateStageAccess(stageId: string): Promise<boolean> {
    console.log('Validating stage access for:', stageId);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return false;
    }

    // Check if user is the creator or a participant
    const { data: stage } = await supabase
      .from('stages')
      .select('creator_id, host_id')
      .eq('id', stageId)
      .maybeSingle();

    if (!stage) {
      return false;
    }

    // User is creator/host
    if (stage.creator_id === user.id || stage.host_id === user.id) {
      return true;
    }

    // Check if user is a participant
    const { data: participant } = await supabase
      .from('stage_participants')
      .select('id')
      .eq('stage_id', stageId)
      .eq('user_id', user.id)
      .is('left_at', null)
      .maybeSingle();

    return !!participant;
  }
}

export default new StageCoreService();
