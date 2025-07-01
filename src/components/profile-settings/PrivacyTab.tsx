
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Eye, Lock, LogOut, Trash2 } from 'lucide-react';

interface PrivacySettings {
  profileVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  twoFactorAuth: boolean;
}

interface PrivacyTabProps {
  settings: PrivacySettings;
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
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <Label>Profile Visibility</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Allow others to view your profile
              </p>
            </div>
            <Switch
              checked={settings.profileVisibility}
              onCheckedChange={(checked) => onSettingChange('profileVisibility', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Show Activity Status</Label>
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
              <Label>Data Collection</Label>
              <p className="text-sm text-muted-foreground">
                Allow anonymous data collection for analytics
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
                <Lock className="h-4 w-4" />
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
          
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={onLogout}
              className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
            
            <Button
              variant="destructive"
              onClick={onDeleteAccount}
              className="w-full justify-start gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </Button>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};
