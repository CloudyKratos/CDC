
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

class AdminService {
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

  // Mock methods for tables that don't exist yet
  async getAllUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      console.log('Mock: Updating user role', userId, role);
      // Mock implementation - would need user_roles table
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      console.log('Mock: Deleting user', userId);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async getAllEvents(): Promise<any[]> {
    try {
      console.log('Mock: Getting all events');
      // Mock implementation - would need events table
      return [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async createEvent(eventData: any): Promise<boolean> {
    try {
      console.log('Mock: Creating event', eventData);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error creating event:', error);
      return false;
    }
  }

  async updateEvent(eventId: string, eventData: any): Promise<boolean> {
    try {
      console.log('Mock: Updating event', eventId, eventData);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error updating event:', error);
      return false;
    }
  }

  async deleteEvent(eventId: string): Promise<boolean> {
    try {
      console.log('Mock: Deleting event', eventId);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  }

  async getUserRoles(): Promise<any[]> {
    try {
      console.log('Mock: Getting user roles');
      // Mock implementation - would need user_roles table
      return [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async assignUserRole(userId: string, role: string): Promise<boolean> {
    try {
      console.log('Mock: Assigning user role', userId, role);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error assigning user role:', error);
      return false;
    }
  }

  async removeUserRole(userId: string, role: string): Promise<boolean> {
    try {
      console.log('Mock: Removing user role', userId, role);
      // Mock implementation
      return true;
    } catch (error) {
      console.error('Error removing user role:', error);
      return false;
    }
  }
}

export default new AdminService();
