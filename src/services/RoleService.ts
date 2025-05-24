
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'moderator' | 'member';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  assigned_by?: string;
  assigned_at: string;
  workspace_id?: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  lastLogin?: string;
  isHidden?: boolean;
}

class RoleService {
  async getCurrentUserRole(workspaceId?: string): Promise<UserRole | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_user_role', {
        _user_id: user.id,
        _workspace_id: workspaceId || null
      });

      if (error) {
        console.error('Error getting user role:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getCurrentUserRole:', error);
      return null;
    }
  }

  async hasRole(role: UserRole, workspaceId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: role,
        _workspace_id: workspaceId || null
      });

      if (error) {
        console.error('Error checking role:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in hasRole:', error);
      return false;
    }
  }

  async assignRole(userId: string, role: UserRole, workspaceId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_by: user.id,
          workspace_id: workspaceId || null
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

  async getUsersWithRoles(workspaceId?: string): Promise<UserWithRole[]> {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          role,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('workspace_id', workspaceId || null);

      if (error) {
        console.error('Error fetching users with roles:', error);
        return [];
      }

      return roles.map(role => {
        const profile = role.profiles as any;
        return {
          id: role.user_id,
          email: profile?.email || '',
          name: profile?.full_name || 'Unknown User',
          role: role.role as UserRole,
          avatar: profile?.avatar_url,
          isHidden: role.role === 'admin' && profile?.full_name?.includes('CDC Support')
        };
      });
    } catch (error) {
      console.error('Error in getUsersWithRoles:', error);
      return [];
    }
  }

  async createAdminAccount(email: string, password: string, fullName: string): Promise<boolean> {
    try {
      // This would typically be done server-side for security
      // For now, we'll create through the auth service
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            is_admin: true,
            is_hidden: true
          }
        }
      });

      if (error) {
        console.error('Error creating admin account:', error);
        return false;
      }

      // Assign admin role
      if (data.user) {
        await this.assignRole(data.user.id, 'admin');
      }

      return true;
    } catch (error) {
      console.error('Error in createAdminAccount:', error);
      return false;
    }
  }

  // Permission checks for different features
  async canManageCalendar(): Promise<boolean> {
    return await this.hasRole('admin');
  }

  async canManageUsers(): Promise<boolean> {
    return await this.hasRole('admin');
  }

  async canModerateStage(): Promise<boolean> {
    const isAdmin = await this.hasRole('admin');
    const isModerator = await this.hasRole('moderator');
    return isAdmin || isModerator;
  }

  async canViewAnalytics(): Promise<boolean> {
    return await this.hasRole('admin');
  }
}

export default new RoleService();
