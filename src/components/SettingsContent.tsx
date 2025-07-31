
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const SettingsContent: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="profile-public" />
              <Label htmlFor="profile-public">Make profile public</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activity-status" />
              <Label htmlFor="activity-status">Show activity status</Label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="email-notifications" defaultChecked />
              <Label htmlFor="email-notifications">Email notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="push-notifications" defaultChecked />
              <Label htmlFor="push-notifications">Push notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="community-updates" />
              <Label htmlFor="community-updates">Community updates</Label>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Manage your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="two-factor" />
              <Label htmlFor="two-factor">Two-factor authentication</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="data-sharing" />
              <Label htmlFor="data-sharing">Allow data sharing for analytics</Label>
            </div>
            <Button variant="outline" className="mt-4">
              Download my data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsContent;
