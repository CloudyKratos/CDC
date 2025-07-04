
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Save, Bell, Mail, Smartphone, Volume2, Clock } from 'lucide-react';

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

interface EnhancedNotificationsTabProps {
  settings: NotificationSettings;
  loading: boolean;
  onSettingChange: (setting: string, value: boolean) => void;
  onSave: () => void;
}

export const EnhancedNotificationsTab: React.FC<EnhancedNotificationsTabProps> = ({
  settings,
  loading,
  onSettingChange,
  onSave
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Manage how and when you receive notifications from the platform.
        </p>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications and updates via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>General Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Important updates, security alerts, and system notifications
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => onSettingChange('emailNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing & Promotional Emails</Label>
              <p className="text-sm text-muted-foreground">
                Product updates, feature announcements, and promotional content
              </p>
            </div>
            <Switch
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => onSettingChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Real-time notifications in your browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Browser Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Instant notifications for messages, mentions, and important events
              </p>
            </div>
            <Switch
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => onSettingChange('pushNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Categories (Preview) */}
      <Card className="opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Categories
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Coming Soon</span>
          </CardTitle>
          <CardDescription>
            Fine-tune which types of notifications you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {[
              { label: 'Community Messages', desc: 'New messages in channels you follow' },
              { label: 'Direct Mentions', desc: 'When someone mentions you directly' },
              { label: 'Event Reminders', desc: 'Upcoming events and meetings' },
              { label: 'System Updates', desc: 'Platform updates and maintenance notices' }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between opacity-50">
                <div className="space-y-0.5">
                  <Label>{item.label}</Label>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch disabled />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours (Preview) */}
      <Card className="opacity-60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Quiet Hours
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Coming Soon</span>
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between opacity-50">
            <div className="space-y-0.5">
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Automatically silence notifications during specified hours
              </p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={onSave} 
          disabled={loading} 
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </div>
  );
};
