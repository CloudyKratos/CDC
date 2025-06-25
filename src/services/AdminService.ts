import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserWithRole, PlatformMetrics, UserStats } from "@/types/supabase-extended";

interface CDCAccountData {
  userId: string;
  accountType: 'standard' | 'premium' | 'enterprise';
  features: string[];
}

class AdminService {
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      return [];
    }
  }

  async getAllUsersWithRoles(): Promise<UserWithRole[]> {
    try {
      // First get all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        return [];
      }

      // Then get all profiles for those users
      const userIds = (rolesData || []).map(role => role.user_id);
      
      if (userIds.length === 0) {
        return [];
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, username, created_at')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return [];
      }

      // Combine the data
      const usersWithRoles = (rolesData || []).map(roleItem => {
        const profile = (profilesData || []).find(p => p.id === roleItem.user_id);
        return {
          id: roleItem.user_id,
          name: profile?.full_name || 'Unknown User',
          email: profile?.email || 'No email',
          role: roleItem.role as UserRole,
          isHidden: false,
          profile: profile
        };
      });

      return usersWithRoles;
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }

  async getUserRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserRoles:', error);
      return [];
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const [usersData, rolesData] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('user_roles').select('role')
      ]);

      const totalUsers = usersData.data?.length || 0;
      const roles = rolesData.data || [];
      
      const adminCount = roles.filter(r => r.role === 'admin').length;
      const moderatorCount = roles.filter(r => r.role === 'moderator').length;
      const memberCount = totalUsers - adminCount - moderatorCount;

      return {
        totalUsers,
        adminCount,
        moderatorCount,
        memberCount,
        activeUsers: totalUsers // Simplified for now
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return {
        totalUsers: 0,
        adminCount: 0,
        moderatorCount: 0,
        memberCount: 0,
        activeUsers: 0
      };
    }
  }

  async getPlatformMetrics(): Promise<PlatformMetrics> {
    try {
      const [usersData, eventsData, stagesData] = await Promise.all([
        supabase.from('profiles').select('id'),
        supabase.from('events').select('id, status'),
        supabase.from('stages').select('id, status')
      ]);

      const totalUsers = usersData.data?.length || 0;
      const events = eventsData.data || [];
      const stages = stagesData.data || [];

      return {
        totalUsers,
        activeUsers: totalUsers, // Simplified
        totalEvents: events.length,
        upcomingEvents: events.filter(e => e.status === 'scheduled').length,
        totalStages: stages.length,
        activeStages: stages.filter(s => s.status === 'live').length,
        totalMessages: 0, // Simplified - would need message counting
        userGrowth: Math.floor(totalUsers * 0.1) // Mock 10% growth
      };
    } catch (error) {
      console.error('Error in getPlatformMetrics:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        totalEvents: 0,
        upcomingEvents: 0,
        totalStages: 0,
        activeStages: 0,
        totalMessages: 0,
        userGrowth: 0
      };
    }
  }

  async assignUserRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error assigning user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignUserRole:', error);
      return false;
    }
  }

  async setupCDCAccount(accountData: CDCAccountData): Promise<boolean> {
    try {
      console.log('Setting up CDC account:', accountData);
      return true;
    } catch (error) {
      console.error('Error in setupCDCAccount:', error);
      return false;
    }
  }

  async setupCDCAsAdmin(): Promise<boolean> {
    try {
      console.log('Setting up CDC as admin');
      return true;
    } catch (error) {
      console.error('Error in setupCDCAsAdmin:', error);
      return false;
    }
  }

  async createCDCOfficialAccount(): Promise<boolean> {
    try {
      console.log('Creating CDC official account');
      return true;
    } catch (error) {
      console.error('Error in createCDCOfficialAccount:', error);
      return false;
    }
  }

  async checkCDCAccountExists(): Promise<boolean> {
    try {
      console.log('Checking CDC account exists');
      return false;
    } catch (error) {
      console.error('Error in checkCDCAccountExists:', error);
      return false;
    }
  }

  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error('Error updating user role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      // Delete user roles first
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Note: We cannot delete from auth.users table directly
      console.log('User deletion requested for:', userId);
      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  }

  async getCDCAccountStatus(userId: string): Promise<any> {
    try {
      console.log('Getting CDC account status for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error getting CDC account status:', error);
        return null;
      }

      return {
        userId,
        accountType: 'standard',
        features: [],
        profile: data
      };
    } catch (error) {
      console.error('Error in getCDCAccountStatus:', error);
      return null;
    }
  }
}

export default new AdminService();
