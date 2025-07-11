
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Shield, Eye, Activity, Database, LogOut, Trash2 } from 'lucide-react';

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  twoFactorAuth: boolean;
}

interface PrivacyTabProps {
  settings: UserSettings;
  loading: boolean;
  onSettingChange: (setting: string, value: boolean) => void;
  onSave: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const PrivacyTab: React.FC<PrivacyTabProps> = ({
  settings,
  loading,
  onSettingChange,
  onSave,
  onLogout,
  onDeleteAccount
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy & Security</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <Label>Profile Visibility</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to other users
              </p>
            </div>
            <Switch 
              checked={settings.profileVisibility}
              onCheckedChange={(checked) => onSettingChange('profileVisibility', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <Label>Activity Status</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Show when you're online to other users
              </p>
            </div>
            <Switch 
              checked={settings.activityStatus}
              onCheckedChange={(checked) => onSettingChange('activityStatus', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <Label>Data Collection</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow us to collect usage data to improve the platform
              </p>
            </div>
            <Switch 
              checked={settings.dataCollection}
              onCheckedChange={(checked) => onSettingChange('dataCollection', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label>Two-Factor Authentication</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch 
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) => onSettingChange('twoFactorAuth', checked)}
            />
          </div>
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
          <h4 className="text-md font-medium text-destructive">Danger Zone</h4>
          <div className="grid gap-4">
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="flex items-center gap-2 justify-start"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteAccount}
              className="flex items-center gap-2 justify-start"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
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
