
import { supabase } from "@/integrations/supabase/client";

// Define our types locally since they're not in the generated types yet
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  category: 'calendar' | 'community' | 'system' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  action_url?: string;
  action_text?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  calendar_events: boolean;
  calendar_reminders: boolean;
  community_messages: boolean;
  community_mentions: boolean;
  system_updates: boolean;
  marketing: boolean;
  digest_frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
}

export interface CreateNotificationRequest {
  template_key: string;
  variables?: Record<string, any>;
  action_url?: string;
  user_id?: string;
}

export class NotificationService {
  // Fetch user notifications with pagination
  static async getNotifications(limit = 50, offset = 0): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
      return (data as Notification[]) || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  // Get notification statistics
  static async getNotificationStats(): Promise<NotificationStats> {
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('read, category, priority');

      if (error) {
        console.error('Error fetching notification stats:', error);
        return {
          total: 0,
          unread: 0,
          by_category: {},
          by_priority: {}
        };
      }

      const notifications = data as Pick<Notification, 'read' | 'category' | 'priority'>[];
      
      const stats: NotificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        by_category: {},
        by_priority: {}
      };

      notifications.forEach(notification => {
        // Count by category
        stats.by_category[notification.category] = (stats.by_category[notification.category] || 0) + 1;
        // Count by priority
        stats.by_priority[notification.priority] = (stats.by_priority[notification.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return {
        total: 0,
        unread: 0,
        by_category: {},
        by_priority: {}
      };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { data, error } = await supabase
        .from('notifications' as any)
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false)
        .select();

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return 0;
      }
      return data?.length || 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return 0;
    }
  }

  // Create a new notification
  static async createNotification(request: CreateNotificationRequest): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !request.user_id) {
        console.error('No authenticated user');
        return null;
      }

      // For now, create notification directly since the function might not be available yet
      const { data, error } = await supabase
        .from('notifications' as any)
        .insert({
          user_id: request.user_id || user?.id,
          title: `Notification: ${request.template_key}`,
          message: 'A new notification has been created',
          type: 'info',
          category: 'general',
          priority: 'medium',
          action_url: request.action_url,
          metadata: request.variables || {}
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        return null;
      }
      return data?.id || null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Get user notification preferences
  static async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('notification_preferences' as any)
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching notification preferences:', error);
        return null;
      }
      return data as NotificationPreferences || null;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  // Update notification preferences
  static async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user');
        return false;
      }

      const { error } = await supabase
        .from('notification_preferences' as any)
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating notification preferences:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Subscribe to real-time notifications
  static subscribeToNotifications(callback: (notification: Notification) => void) {
    try {
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('New notification:', payload);
            if (payload.new) {
              callback(payload.new as Notification);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'notifications'
          },
          (payload) => {
            console.log('Updated notification:', payload);
            if (payload.new) {
              callback(payload.new as Notification);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      console.error('Error setting up notification subscription:', error);
      return () => {};
    }
  }

  // Batch operations
  static async batchMarkAsRead(notificationIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications' as any)
        .update({ read: true, updated_at: new Date().toISOString() })
        .in('id', notificationIds);

      if (error) {
        console.error('Error batch marking notifications as read:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error batch marking notifications as read:', error);
      return false;
    }
  }

  // Get notifications by category
  static async getNotificationsByCategory(category: string, limit = 20): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications' as any)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching notifications by category:', error);
        return [];
      }
      return (data as Notification[]) || [];
    } catch (error) {
      console.error('Error fetching notifications by category:', error);
      return [];
    }
  }

  // Clean up old notifications
  static async cleanupOldNotifications(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('notifications' as any)
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('read', true)
        .select();

      if (error) {
        console.error('Error cleaning up old notifications:', error);
        return 0;
      }
      return data?.length || 0;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      return 0;
    }
  }
}
