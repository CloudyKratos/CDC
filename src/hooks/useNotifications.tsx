
import { useState, useCallback } from 'react';
import { NotificationType } from '@/types/notification';
import { Calendar, Users, User, Bell, FileText, Settings } from 'lucide-react';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationType[]>([
    {
      id: 1,
      title: "New Quest Available",
      description: "Complete your daily warrior challenge",
      time: "2 minutes ago",
      read: false,
      type: 'event',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: 2,
      title: "Community Message",
      description: "Someone mentioned you in general chat",
      time: "10 minutes ago",
      read: false,
      type: 'message',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 3,
      title: "Profile Updated",
      description: "Your profile changes have been saved",
      time: "1 hour ago",
      read: true,
      type: 'system',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 4,
      title: "New Document Shared",
      description: "A new resource has been added to Command Room",
      time: "2 hours ago",
      read: true,
      type: 'document',
      icon: <FileText className="h-4 w-4" />
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationType, 'id'>) => {
    const newNotification: NotificationType = {
      ...notification,
      id: Date.now(), // Simple ID generation
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  };
};
