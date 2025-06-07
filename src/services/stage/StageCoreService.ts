
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Stage = Database['public']['Tables']['stages']['Row'];
type StageInsert = Database['public']['Tables']['stages']['Insert'];
export type StageStatus = 'scheduled' | 'live' | 'ended';

class StageCoreService {
  private retryDelay = 1000;
  private maxRetries = 3;

  private async retryOperation<T>(
    operation: () => Promise<T>,
    retries = this.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        console.log(`Operation failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryOperation(operation, retries - 1);
      }
      throw error;
    }
  }

  async createStage(stageData: Omit<StageInsert, 'creator_id'>): Promise<Stage | null> {
    return this.retryOperation(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('stages')
        .insert([{
          ...stageData,
          creator_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async getActiveStages(): Promise<Stage[]> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .in('status', ['scheduled', 'live'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    });
  }

  async getStageById(stageId: string): Promise<Stage | null> {
    return this.retryOperation(async () => {
      const { data, error } = await supabase
        .from('stages')
        .select('*')
        .eq('id', stageId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Stage not found. The stage may have been deleted or the link is incorrect.');
        }
        throw new Error(`Failed to load stage: ${error.message}`);
      }
      return data;
    });
  }

  async updateStageStatus(stageId: string, status: StageStatus): Promise<boolean> {
    return this.retryOperation(async () => {
      const updates: any = { status };
      
      if (status === 'live') {
        updates.actual_start_time = new Date().toISOString();
      } else if (status === 'ended') {
        updates.end_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('stages')
        .update(updates)
        .eq('id', stageId);

      if (error) throw error;
      return true;
    });
  }

  async validateStageAccess(stageId: string): Promise<{ canAccess: boolean; reason?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { canAccess: false, reason: 'Authentication required. Please log in to access the stage.' };

      const stage = await this.getStageById(stageId);
      if (!stage) return { canAccess: false, reason: 'Stage not found. The stage may have been deleted or moved.' };
      
      if (stage.status === 'ended') {
        return { canAccess: false, reason: 'This stage has already ended. Check for recordings or upcoming sessions.' };
      }

      return { canAccess: true };
    } catch (error) {
      console.error('Error validating stage access:', error);
      if (error instanceof Error) {
        return { canAccess: false, reason: error.message };
      }
      return { canAccess: false, reason: 'Unable to validate stage access. Please check your connection and try again.' };
    }
  }
}

export default new StageCoreService();
