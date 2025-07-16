
import { useState, useEffect, useCallback } from 'react';
import { NotificationService, Notification, NotificationStats } from '@/services/NotificationService';
import { toast } from 'sonner';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    by_category: {},
    by_priority: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [notificationsData, statsData] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getNotificationStats()
      ]);
      
      setNotifications(notificationsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notifications');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (id: string) => {
    const success = await NotificationService.markAsRead(id);
    if (success) {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1)
      }));
    }
    return success;
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const count = await NotificationService.markAllAsRead();
    if (count > 0) {
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setStats(prev => ({
        ...prev,
        unread: 0
      }));
      toast.success(`Marked ${count} notifications as read`);
    }
    return count;
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    const success = await NotificationService.deleteNotification(id);
    if (success) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: prev.unread - (notifications.find(n => n.id === id)?.read ? 0 : 1)
      }));
    }
    return success;
  }, [notifications]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setStats(prev => ({
      ...prev,
      total: prev.total + 1,
      unread: prev.unread + (notification.read ? 0 : 1),
      by_category: {
        ...prev.by_category,
        [notification.category]: (prev.by_category[notification.category] || 0) + 1
      },
      by_priority: {
        ...prev.by_priority,
        [notification.priority]: (prev.by_priority[notification.priority] || 0) + 1
      }
    }));

    // Show toast for high priority notifications
    if (notification.priority === 'high' || notification.priority === 'urgent') {
      toast(notification.title, {
        description: notification.message,
        action: notification.action_url ? {
          label: notification.action_text || 'View',
          onClick: () => window.location.href = notification.action_url!
        } : undefined
      });
    }
  }, []);

  // Update notification (for real-time updates)
  const updateNotification = useCallback((updatedNotification: Notification) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === updatedNotification.id 
          ? updatedNotification 
          : notification
      )
    );
  }, []);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Set up real-time subscription
  useEffect(() => {
    const unsubscribe = NotificationService.subscribeToNotifications((notification) => {
      // Check if this is a new notification or an update
      const existingNotification = notifications.find(n => n.id === notification.id);
      if (existingNotification) {
        updateNotification(notification);
      } else {
        addNotification(notification);
      }
    });

    return unsubscribe;
  }, [addNotification, updateNotification, notifications]);

  const unreadCount = stats.unread;
  const recentNotifications = notifications.slice(0, 10);
  const hasUnread = unreadCount > 0;

  return {
    notifications,
    recentNotifications,
    stats,
    unreadCount,
    hasUnread,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loadNotifications,
    addNotification
  };
};
