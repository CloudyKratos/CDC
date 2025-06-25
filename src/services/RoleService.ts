
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'moderator' | 'user';

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

  async checkUserRole(userId: string): Promise<UserRole | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_role', { 
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

  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      // Since we don't have the has_role function, we'll check directly
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role)
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

  async assignRole(userId: string, role: UserRole): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          assigned_at: new Date().toISOString()
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

  async isAdmin(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'admin');
  }

  async isModerator(userId: string): Promise<boolean> {
    return this.hasRole(userId, 'moderator');
  }
}

export default new RoleService();
