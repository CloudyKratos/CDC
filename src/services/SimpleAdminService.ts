
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
}

interface PlatformMetrics {
  totalStages: number;
  activeStages: number;
  totalMessages: number;
}

class SimpleAdminService {
  async getUserStats(): Promise<UserStats> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, created_at, updated_at');

      if (error) {
        console.error('Error fetching user stats:', error);
        return {
          totalUsers: 0,
          activeUsers: 0
        };
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsers = profiles?.filter(profile => 
        new Date(profile.updated_at) >= thirtyDaysAgo
      ).length || 0;

      return {
        totalUsers: profiles?.length || 0,
        activeUsers
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0
      };
    }
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      // Get total stages
      const { data: stages } = await supabase
        .from('stages')
        .select('id, is_active');

      // Get total messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id');

      const activeStages = stages?.filter(s => s.is_active).length || 0;

      return {
        totalStages: stages?.length || 0,
        activeStages,
        totalMessages: messages?.length || 0
      };
    } catch (error) {
      console.error('Error in getPlatformMetrics:', error);
      return {
        totalStages: 0,
        activeStages: 0,
        totalMessages: 0
      };
    }
  }
}

export default new SimpleAdminService();
