
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

export interface NotificationSubscription {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  subscription_type: 'all' | 'mentions' | 'updates';
  created_at: string;
}

export interface NotificationTemplate {
  id: string;
  template_key: string;
  title_template: string;
  message_template: string;
  category: string;
  type: string;
  priority: string;
  action_text?: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationRequest {
  template_key: string;
  variables?: Record<string, any>;
  action_url?: string;
  user_id?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_category: Record<string, number>;
  by_priority: Record<string, number>;
}
