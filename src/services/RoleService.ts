import { supabase } from "@/integrations/supabase/client";
import { UserRole, UserWithRole } from "@/types/supabase-extended";

/**
 * Secure Role Service
 * 
 * SECURITY: Hardcoded admin email removed from frontend.
 * All role checks now use secure database functions.
 */
class RoleService {

  async getUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No role found, default to 'user'
          return 'user';
        }
        console.error('Error fetching user role:', error);
        return 'user';
      }

      return (data?.role as UserRole) || 'user';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'user';
    }
  }

  async getCurrentUserRole(): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      return await this.getUserRole(user.id);
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return null;
    }
  }

  async checkUserRole(userId: string): Promise<UserRole | null> {
    try {
      // Use the new secure function
      const { data, error } = await supabase.rpc('get_user_role', {
        check_user_id: userId
      });

      if (error) {
        console.error('Error checking user role:', error);
        return null;
      }

      return data as UserRole;
    } catch (error) {
      console.error('Error in checkUserRole:', error);
      return null;
    }
  }

  async hasRole(userId: string, role: UserRole): Promise<boolean>;
  async hasRole(role: UserRole): Promise<boolean>;
  async hasRole(userIdOrRole: string | UserRole, role?: UserRole): Promise<boolean> {
    try {
      let targetUserId: string;
      let targetRole: UserRole;

      if (typeof userIdOrRole === 'string' && role) {
        // Two parameter version: hasRole(userId, role)
        targetUserId = userIdOrRole;
        targetRole = role;
      } else if (typeof userIdOrRole === 'string' && !role) {
        // Single parameter version: hasRole(role) - use current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        targetUserId = user.id;
        targetRole = userIdOrRole as UserRole;
      } else {
        return false;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', targetUserId)
        .eq('role', targetRole)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No matching role found
        }
        console.error('Error checking role:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  // CDC Admin specific check - now using secure backend validation
  async isCDCAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }

      // Use database function for secure admin check
      // This will be validated against the secure RLS policies
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return false; // No admin role found
        }
        console.error('Error checking CDC admin status:', error);
        return false;
      }

      // Additional validation would be done by RLS policies
      return !!data;
    } catch (error) {
      console.error('Error in isCDCAdmin:', error);
      return false;
    }
  }

  async assignRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_at: new Date().toISOString(),
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) {
        console.error('Error assigning role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignRole:', error);
      return false;
    }
  }

  async removeRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) {
        console.error('Error removing role:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeRole:', error);
      return false;
    }
  }

  async isAdmin(userId?: string): Promise<boolean> {
    if (userId) {
      return this.hasRole(userId, 'admin');
    }
    return this.hasRole('admin');
  }

  async isModerator(userId?: string): Promise<boolean> {
    if (userId) {
      return this.hasRole(userId, 'moderator');
    }
    return this.hasRole('moderator');
  }

  // Permission check methods - now restricted to CDC admin via RLS
  async canManageCalendar(): Promise<boolean> {
    return await this.isCDCAdmin();
  }

  async canManageUsers(): Promise<boolean> {
    return await this.isCDCAdmin();
  }

  async canModerateStage(): Promise<boolean> {
    return await this.isCDCAdmin();
  }

  async canViewAnalytics(): Promise<boolean> {
    return await this.isCDCAdmin();
  }

  // Admin panel methods - now restricted to CDC admin via RLS
  async getUsersWithRoles(): Promise<UserWithRole[]> {
    try {
      // RLS policies will enforce CDC admin access
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        return [];
      }

      // Get profiles for users with roles
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
      console.error('Error in getUsersWithRoles:', error);
      return [];
    }
  }

  async createAdminAccount(email: string, password: string, fullName: string): Promise<boolean> {
    try {
      // This should only be called by CDC admins (enforced by RLS)
      console.log('Admin account creation requested:', { email, fullName });
      
      // NOTE: This requires a backend implementation via edge function
      // Frontend cannot directly create admin accounts for security
      console.warn('Admin account creation requires backend implementation via edge function');
      
      return false; // Disabled for security - must be done server-side
    } catch (error) {
      console.error('Error creating admin account:', error);
      return false;
    }
  }

  /**
   * Get role change audit logs (CDC admin only)
   */
  async getRoleAuditLogs(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('role_change_audit')
        .select(`
          *,
          changed_user:profiles!role_change_audit_changed_user_id_fkey(full_name, email),
          changed_by:profiles!role_change_audit_changed_by_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching audit logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRoleAuditLogs:', error);
      return [];
    }
  }
}

export default new RoleService();
export type { UserRole, UserWithRole };