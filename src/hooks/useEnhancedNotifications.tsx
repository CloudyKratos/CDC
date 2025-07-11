
import { useState, useCallback, useEffect } from 'react';
import { NotificationType } from '@/types/notification';
import { Calendar, Users, User, Bell, FileText, Settings, Mail, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useEnhancedNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  // Sample notifications - in a real app, these would come from the database
  const sampleNotifications: NotificationType[] = [
    {
      id: 1,
      title: "Welcome to the Community!",
      description: "Complete your profile to unlock all features",
      time: "2 minutes ago",
      read: false,
      type: 'user',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 2,
      title: "New Quest Available",
      description: "Complete your daily warrior challenge for 50 XP",
      time: "5 minutes ago",
      read: false,
      type: 'event',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 3,
      title: "Community Update",
      description: "Check out the latest features and improvements",
      time: "1 hour ago",
      read: true,
      type: 'announcement',
      icon: <Bell className="h-4 w-4" />
    },
    {
      id: 4,
      title: "Profile Achievement",
      description: "You've reached level 2! Keep up the great work",
      time: "2 hours ago",
      read: true,
      type: 'system',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 5,
      title: "New Document Shared",
      description: "Training materials have been added to your library",
      time: "1 day ago",
      read: true,
      type: 'document',
      icon: <FileText className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    // Initialize with sample data
    setNotifications(sampleNotifications);
    setLoading(false);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
    toast.success('Notification marked as read');
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    toast.success('All notifications marked as read');
  }, []);

  const deleteNotification = useCallback((id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notification deleted');
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationType, 'id'>) => {
    const newNotification: NotificationType = {
      ...notification,
      id: Date.now(), // Simple ID generation
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    toast.success('New notification received');
  }, []);

  const getNotificationsByType = useCallback((type: NotificationType['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    toast.success('All notifications cleared');
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationsByType,
    clearAllNotifications
  };
};
