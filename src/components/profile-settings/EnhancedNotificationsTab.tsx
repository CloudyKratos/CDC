
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Bell, Mail, MessageSquare, Shield } from 'lucide-react';

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  twoFactorAuth: boolean;
}

interface EnhancedNotificationsTabProps {
  settings: UserSettings;
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
        <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <Label>Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch 
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => onSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <Label>Push Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive push notifications in your browser
              </p>
            </div>
            <Switch 
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => onSettingChange('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <Label>Marketing Emails</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive marketing and promotional emails
              </p>
            </div>
            <Switch 
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => onSettingChange('marketingEmails', checked)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
