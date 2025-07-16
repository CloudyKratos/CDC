
import React, { useState, useEffect } from 'react';
import { NotificationService } from '@/services/NotificationService';
import { NotificationPreferences as NotificationPrefsType } from '@/types/notifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Bell, Mail, Calendar, Users, Settings, Clock } from 'lucide-react';

interface NotificationPreferencesProps {
  onClose?: () => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ onClose }) => {
  const [preferences, setPreferences] = useState<NotificationPrefsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      const success = await NotificationService.updatePreferences(preferences);
      
      if (success) {
        toast.success('Notification preferences updated successfully');
        if (onClose) onClose();
      } else {
        toast.error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPrefsType, value: any) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: value
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600 dark:text-gray-400">Failed to load preferences</p>
        <Button onClick={loadPreferences} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Delivery Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled">Email Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.email_enabled}
              onCheckedChange={(checked) => updatePreference('email_enabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-enabled">Push Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Receive browser push notifications
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={preferences.push_enabled}
              onCheckedChange={(checked) => updatePreference('push_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Categories
          </CardTitle>
          <CardDescription>
            Control which types of notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <div>
                <Label htmlFor="calendar-events">Calendar Events</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New events, updates, and invitations
                </p>
              </div>
            </div>
            <Switch
              id="calendar-events"
              checked={preferences.calendar_events}
              onCheckedChange={(checked) => updatePreference('calendar_events', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <div>
                <Label htmlFor="calendar-reminders">Calendar Reminders</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reminders for upcoming events
                </p>
              </div>
            </div>
            <Switch
              id="calendar-reminders"
              checked={preferences.calendar_reminders}
              onCheckedChange={(checked) => updatePreference('calendar_reminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <div>
                <Label htmlFor="community-messages">Community Messages</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New messages in channels you follow
                </p>
              </div>
            </div>
            <Switch
              id="community-messages"
              checked={preferences.community_messages}
              onCheckedChange={(checked) => updatePreference('community_messages', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <div>
                <Label htmlFor="community-mentions">Mentions & Replies</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  When someone mentions you or replies to your messages
                </p>
              </div>
            </div>
            <Switch
              id="community-mentions"
              checked={preferences.community_mentions}
              onCheckedChange={(checked) => updatePreference('community_mentions', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <div>
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Platform updates, maintenance, and announcements
                </p>
              </div>
            </div>
            <Switch
              id="system-updates"
              checked={preferences.system_updates}
              onCheckedChange={(checked) => updatePreference('system_updates', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing">Marketing & Promotions</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Feature announcements and promotional content
              </p>
            </div>
            <Switch
              id="marketing"
              checked={preferences.marketing}
              onCheckedChange={(checked) => updatePreference('marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timing & Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timing & Frequency
          </CardTitle>
          <CardDescription>
            Control when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="digest-frequency">Email Digest Frequency</Label>
            <Select
              value={preferences.digest_frequency}
              onValueChange={(value) => updatePreference('digest_frequency', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start">Quiet Hours Start</Label>
              <input
                id="quiet-start"
                type="time"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.quiet_hours_start || ''}
                onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">Quiet Hours End</Label>
              <input
                id="quiet-end"
                type="time"
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={preferences.quiet_hours_end || ''}
                onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
              />
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            During quiet hours, you'll only receive urgent notifications
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
