import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CDCAdminData {
  email: string;
  name: string;
  isHidden: boolean;
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  moderatorCount: number;
  memberCount: number;
  activeUsers: number;
}

interface PlatformMetrics {
  totalEvents: number;
  activeStages: number;
  totalMessages: number;
  userGrowth: number;
}

class AdminService {
  async createCDCOfficialAccount(): Promise<boolean> {
    try {
      console.log("Setting up CDC Official Team account...");
      
      // Check if the CDC account already exists
      const { data: existingUser, error: userError } = await supabase.auth.admin.getUserByEmail(
        'cdcofficialeg@gmail.com'
      );

      if (userError && userError.message !== 'User not found') {
        console.error('Error checking for existing user:', userError);
        toast.error('Failed to check for existing CDC account');
        return false;
      }

      let userId: string;

      if (existingUser?.user) {
        // User already exists, use their ID
        userId = existingUser.user.id;
        console.log('Found existing CDC user:', userId);
      } else {
        // Create new user if it doesn't exist
        const { data, error } = await supabase.auth.signUp({
          email: 'cdcofficialeg@gmail.com',
          password: 'CDC2024!SecurePassword',
          options: {
            data: {
              full_name: 'CDC Official Team',
              is_admin: true,
              is_hidden: true,
              account_type: 'system'
            }
          }
        });

        if (error) {
          console.error('Error creating CDC account:', error);
          toast.error('Failed to create CDC Official Team account');
          return false;
        }

        if (!data.user) {
          console.error('No user returned from signup');
          return false;
        }

        userId = data.user.id;
        console.log('Created new CDC user:', userId);
      }

      // Assign admin role to the CDC account
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: 'admin'
        });

      if (roleError) {
        console.error('Error assigning admin role:', roleError);
        toast.error('Failed to assign admin role');
        return false;
      }

      // Create or update profile entry
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          full_name: 'CDC Official Team',
          bio: 'Official CDC Support Team - System Administrator',
          username: 'cdc_official_team'
        });

      if (profileError) {
        console.error('Error creating/updating profile:', profileError);
      }

      console.log('CDC Official Team account setup successfully');
      toast.success('CDC Official Team account setup successfully');
      return true;
    } catch (error) {
      console.error('Error in createCDCOfficialAccount:', error);
      toast.error('Failed to setup CDC Official Team account');
      return false;
    }
  }

  async checkCDCAccountExists(): Promise<boolean> {
    try {
      // Check if CDC account exists and has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id (
            full_name
          )
        `)
        .eq('role', 'admin');

      if (error) {
        console.error('Error checking CDC account:', error);
        return false;
      }

      // Look for CDC Official Team in the admin accounts
      const cdcAccount = roles.find(role => 
        role.profiles?.full_name === 'CDC Official Team' ||
        role.profiles?.full_name?.includes('CDC')
      );

      return !!cdcAccount;
    } catch (error) {
      console.error('Error in checkCDCAccountExists:', error);
      return false;
    }
  }

  async getUserStats(): Promise<UserStats> {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role, user_id');

      if (error) {
        console.error('Error fetching user stats:', error);
        return {
          totalUsers: 0,
          adminCount: 0,
          moderatorCount: 0,
          memberCount: 0,
          activeUsers: 0
        };
      }

      const stats = roles.reduce((acc, curr) => {
        acc.totalUsers++;
        switch (curr.role) {
          case 'admin':
            acc.adminCount++;
            break;
          case 'moderator':
            acc.moderatorCount++;
            break;
          case 'member':
            acc.memberCount++;
            break;
        }
        return acc;
      }, {
        totalUsers: 0,
        adminCount: 0,
        moderatorCount: 0,
        memberCount: 0,
        activeUsers: 0
      });

      // Get active users (users with recent activity)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: activeUserData } = await supabase
        .from('profiles')
        .select('id')
        .gte('updated_at', thirtyDaysAgo.toISOString());

      stats.activeUsers = activeUserData?.length || 0;

      return stats;
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
      // Get total events
      const { data: events } = await supabase
        .from('events')
        .select('id');

      // Get active stages
      const { data: stages } = await supabase
        .from('stages')
        .select('id')
        .eq('status', 'live');

      // Get total messages
      const { data: messages } = await supabase
        .from('messages')
        .select('id');

      // Calculate user growth (new users in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: newUsers } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        totalEvents: events?.length || 0,
        activeStages: stages?.length || 0,
        totalMessages: messages?.length || 0,
        userGrowth: newUsers?.length || 0
      };
    } catch (error) {
      console.error('Error in getPlatformMetrics:', error);
      return {
        totalEvents: 0,
        activeStages: 0,
        totalMessages: 0,
        userGrowth: 0
      };
    }
  }

  async getAllUsersWithRoles() {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          assigned_at,
          profiles:user_id (
            id,
            full_name,
            username,
            avatar_url,
            created_at,
            updated_at
          )
        `);

      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }

      return data.map(item => ({
        id: item.user_id,
        role: item.role,
        assignedAt: item.assigned_at,
        profile: item.profiles
      }));
    } catch (error) {
      console.error('Error in getAllUsersWithRoles:', error);
      return [];
    }
  }

  async assignUserRole(userId: string, role: 'admin' | 'moderator' | 'member') {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role
        });

      if (error) {
        console.error('Error assigning role:', error);
        toast.error('Failed to assign role');
        return false;
      }

      toast.success(`Role assigned successfully`);
      return true;
    } catch (error) {
      console.error('Error in assignUserRole:', error);
      toast.error('Failed to assign role');
      return false;
    }
  }
}

export default new AdminService();
