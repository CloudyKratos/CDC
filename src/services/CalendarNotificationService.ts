
import { NotificationService } from './NotificationService';
import { supabase } from '@/integrations/supabase/client';

export class CalendarNotificationService {
  // Send notification when user creates an event
  static async notifyEventCreated(eventId: string, eventTitle: string, startTime: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await NotificationService.createNotification({
        template_key: 'event_created',
        variables: {
          event_title: eventTitle,
          event_id: eventId,
          start_time: new Date(startTime).toLocaleDateString()
        },
        action_url: `/calendar?event=${eventId}`
      });
    } catch (error) {
      console.error('Error sending event created notification:', error);
    }
  }

  // Send notification when event is updated
  static async notifyEventUpdated(eventId: string, eventTitle: string, startTime: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await NotificationService.createNotification({
        template_key: 'event_updated',
        variables: {
          event_title: eventTitle,
          event_id: eventId,
          start_time: new Date(startTime).toLocaleDateString()
        },
        action_url: `/calendar?event=${eventId}`
      });
    } catch (error) {
      console.error('Error sending event updated notification:', error);
    }
  }

  // Send reminder notification (this would typically be called by a cron job)
  static async sendEventReminder(eventId: string, eventTitle: string, reminderType: '1h' | '1d') {
    try {
      // Get event details
      const { data: event, error } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (error || !event) return;

      const templateKey = reminderType === '1h' ? 'event_reminder_1h' : 'event_reminder_1d';

      await NotificationService.createNotification({
        template_key: templateKey,
        variables: {
          event_title: eventTitle,
          event_id: eventId
        },
        action_url: `/calendar?event=${eventId}`,
        user_id: event.created_by
      });
    } catch (error) {
      console.error('Error sending event reminder:', error);
    }
  }

  // Notify when user RSVPs to an event
  static async notifyEventRSVP(eventId: string, eventTitle: string, userName: string) {
    try {
      // Get event creator
      const { data: event, error } = await supabase
        .from('events')
        .select('created_by')
        .eq('id', eventId)
        .single();

      if (error || !event) return;

      await NotificationService.createNotification({
        template_key: 'event_rsvp',
        variables: {
          event_title: eventTitle,
          user_name: userName,
          event_id: eventId
        },
        action_url: `/calendar?event=${eventId}`,
        user_id: event.created_by
      });
    } catch (error) {
      console.error('Error sending RSVP notification:', error);
    }
  }

  // Send system announcements
  static async sendSystemAnnouncement(title: string, message: string, actionUrl?: string) {
    try {
      // Get all users (in a real app, you'd probably batch this or use a queue)
      const { data: users, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;

      // Create notification for each user
      for (const user of users.users) {
        await NotificationService.createNotification({
          template_key: 'system_update',
          variables: {
            title: title,
            message: message
          },
          action_url: actionUrl,
          user_id: user.id
        });
      }
    } catch (error) {
      console.error('Error sending system announcement:', error);
    }
  }
}
