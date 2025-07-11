
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Eye, 
  Users, 
  Globe, 
  Lock, 
  Trash2, 
  AlertTriangle,
  Download,
  Shield
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PrivacyDataSectionProps {
  user?: any;
}

export const PrivacyDataSection: React.FC<PrivacyDataSectionProps> = ({ user }) => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: user?.privacy?.profile_visibility || 'public', // 'public', 'members', 'private'
    activityStatus: user?.privacy?.activity_status ?? true,
    dataCollection: user?.privacy?.data_collection ?? true,
    analyticsTracking: user?.privacy?.analytics_tracking ?? false
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase
      // await supabase.from('user_privacy_settings').upsert({
      //   user_id: user.id,
      //   ...privacySettings
      // });
      console.log('Saving privacy settings:', privacySettings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      alert('Please type "DELETE" to confirm');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase
      // This should be handled server-side with proper data cleanup
      console.log('Deleting account...');
      // await supabase.rpc('delete_user_account', { user_id: user.id });
    } catch (error) {
      console.error('Error deleting account:', error);
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase to export user data
      console.log('Exporting user data...');
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const PrivacyToggle = ({ 
    icon: Icon, 
    title, 
    description, 
    checked, 
    onChange 
  }: {
    icon: any;
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <Label className="font-medium text-foreground cursor-pointer" htmlFor={title}>
            {title}
          </Label>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <Switch
        id={title}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Privacy & Data</h2>
        <p className="text-muted-foreground">Control your privacy settings and manage your data.</p>
      </div>

      {/* Profile Visibility */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Profile Visibility</h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose who can see your profile information and activity.
          </p>
          
          <RadioGroup 
            value={privacySettings.profileVisibility} 
            onValueChange={(value) => setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50">
              <RadioGroupItem value="public" id="public" />
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="public" className="font-medium">Public</Label>
                  <p className="text-sm text-muted-foreground">Anyone can see your profile</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50">
              <RadioGroupItem value="members" id="members" />
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="members" className="font-medium">Members Only</Label>
                  <p className="text-sm text-muted-foreground">Only platform members can see your profile</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 rounded-lg border border-border/50">
              <RadioGroupItem value="private" id="private" />
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-primary" />
                <div>
                  <Label htmlFor="private" className="font-medium">Private</Label>
                  <p className="text-sm text-muted-foreground">Only you can see your profile</p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </div>
      </Card>

      {/* Data & Analytics */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Data & Analytics</h3>
        </div>

        <div className="space-y-4">
          <PrivacyToggle
            icon={Eye}
            title="Activity Status"
            description="Show when you're online and your last seen status"
            checked={privacySettings.activityStatus}
            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, activityStatus: checked }))}
          />
          
          <PrivacyToggle
            icon={Shield}
            title="Data Collection"
            description="Allow collection of usage data to improve your experience"
            checked={privacySettings.dataCollection}
            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, dataCollection: checked }))}
          />
          
          <PrivacyToggle
            icon={Eye}
            title="Analytics Tracking"
            description="Help us improve the platform with anonymous analytics"
            checked={privacySettings.analyticsTracking}
            onChange={(checked) => setPrivacySettings(prev => ({ ...prev, analyticsTracking: checked }))}
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Data Management</h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-foreground">Export Your Data</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Download a copy of all your data including profile, messages, and activity
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDataExport}
                disabled={isLoading}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 space-y-6 border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
        </div>

        <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription>
                    This action will permanently delete your account and all associated data. 
                    This includes your profile, messages, and all activity history.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    To confirm deletion, please type <strong>DELETE</strong> below:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type DELETE to confirm"
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-destructive"
                  />
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteConfirmation('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE' || isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};
