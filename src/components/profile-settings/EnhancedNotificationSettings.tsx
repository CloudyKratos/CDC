
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Bell, 
  Mail, 
  Smartphone, 
  MessageSquare, 
  Users, 
  Calendar, 
  AtSign,
  AlertCircle,
  Volume2,
  VolumeX,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettings {
  // Email notifications
  emailNotifications: boolean;
  communityEmailNotifications: boolean;
  directMessageEmails: boolean;
  eventReminderEmails: boolean;
  mentionEmails: boolean;
  securityAlertEmails: boolean;
  marketingEmails: boolean;
  
  // Push notifications
  pushNotifications: boolean;
  communityPushNotifications: boolean;
  directMessagePush: boolean;
  eventReminderPush: boolean;
  mentionPush: boolean;
  securityAlertPush: boolean;
  
  // Community specific
  channelNotifications: boolean;
  newMemberNotifications: boolean;
  pollNotifications: boolean;
  moderationNotifications: boolean;
  
  // System
  profileVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  twoFactorAuth: boolean;
}

export const EnhancedNotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    communityEmailNotifications: true,
    directMessageEmails: true,
    eventReminderEmails: true,
    mentionEmails: true,
    securityAlertEmails: true,
    marketingEmails: false,
    pushNotifications: true,
    communityPushNotifications: true,
    directMessagePush: true,
    eventReminderPush: true,
    mentionPush: true,
    securityAlertPush: true,
    channelNotifications: true,
    newMemberNotifications: false,
    pollNotifications: true,
    moderationNotifications: false,
    profileVisibility: true,
    activityStatus: true,
    dataCollection: true,
    twoFactorAuth: false,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserSettings();
    }
  }, [user?.id]);

  const loadUserSettings = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }
      
      if (data) {
        setSettings(prev => ({
          ...prev,
          emailNotifications: data.email_notifications ?? true,
          pushNotifications: data.push_notifications ?? true,
          marketingEmails: data.marketing_emails ?? false,
          profileVisibility: data.profile_visibility ?? true,
          activityStatus: data.activity_status ?? true,
          dataCollection: data.data_collection ?? true,
          twoFactorAuth: data.two_factor_auth ?? false,
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (setting: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          email_notifications: settings.emailNotifications,
          push_notifications: settings.pushNotifications,
          marketing_emails: settings.marketingEmails,
          profile_visibility: settings.profileVisibility,
          activity_status: settings.activityStatus,
          data_collection: settings.dataCollection,
          two_factor_auth: settings.twoFactorAuth,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const NotificationToggle = ({ 
    icon: Icon, 
    title, 
    description, 
    checked, 
    onChange,
    isNew = false,
    isRecommended = false
  }: {
    icon: any;
    title: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    isNew?: boolean;
    isRecommended?: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-border transition-all duration-200 hover:shadow-sm">
      <div className="flex items-start gap-4 flex-1">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Label className="font-medium text-foreground cursor-pointer" htmlFor={title}>
              {title}
            </Label>
            {isNew && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                New
              </Badge>
            )}
            {isRecommended && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                Recommended
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch
        id={title}
        checked={checked}
        onCheckedChange={onChange}
      />
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground">Customize how and when you want to receive notifications from the community and system.</p>
      </div>

      {/* Email Notifications */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardTitle className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Control which notifications you receive via email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <NotificationToggle
            icon={Mail}
            title="Master Email Switch"
            description="Enable or disable all email notifications"
            checked={settings.emailNotifications}
            onChange={(checked) => handleSettingChange('emailNotifications', checked)}
          />
          
          <Separator />
          
          <div className="space-y-4 opacity-75">
            <NotificationToggle
              icon={Users}
              title="Community Activity"
              description="Get notified about new messages and activity in channels you follow"
              checked={settings.communityEmailNotifications}
              onChange={(checked) => handleSettingChange('communityEmailNotifications', checked)}
              isRecommended
            />
            
            <NotificationToggle
              icon={MessageSquare}
              title="Direct Messages"
              description="Email notifications for direct messages sent to you"
              checked={settings.directMessageEmails}
              onChange={(checked) => handleSettingChange('directMessageEmails', checked)}
            />
            
            <NotificationToggle
              icon={Calendar}
              title="Event Reminders"
              description="Receive reminders about upcoming events and meetings"
              checked={settings.eventReminderEmails}
              onChange={(checked) => handleSettingChange('eventReminderEmails', checked)}
            />
            
            <NotificationToggle
              icon={AtSign}
              title="Mentions & Replies"
              description="Get notified when someone mentions you or replies to your messages"
              checked={settings.mentionEmails}
              onChange={(checked) => handleSettingChange('mentionEmails', checked)}
              isRecommended
            />
            
            <NotificationToggle
              icon={AlertCircle}
              title="Security Alerts"
              description="Important security notifications about your account"
              checked={settings.securityAlertEmails}
              onChange={(checked) => handleSettingChange('securityAlertEmails', checked)}
            />
            
            <NotificationToggle
              icon={Mail}
              title="Marketing & Updates"
              description="Product updates, newsletters, and promotional content"
              checked={settings.marketingEmails}
              onChange={(checked) => handleSettingChange('marketingEmails', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardTitle className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-green-600" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Real-time notifications delivered to your browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <NotificationToggle
            icon={Bell}
            title="Master Push Switch"
            description="Enable or disable all push notifications"
            checked={settings.pushNotifications}
            onChange={(checked) => handleSettingChange('pushNotifications', checked)}
          />
          
          <Separator />
          
          <div className="space-y-4 opacity-75">
            <NotificationToggle
              icon={Users}
              title="Community Messages"
              description="Instant notifications for new community messages"
              checked={settings.communityPushNotifications}
              onChange={(checked) => handleSettingChange('communityPushNotifications', checked)}
              isNew
            />
            
            <NotificationToggle
              icon={MessageSquare}
              title="Direct Messages"
              description="Push notifications for direct messages"
              checked={settings.directMessagePush}
              onChange={(checked) => handleSettingChange('directMessagePush', checked)}
            />
            
            <NotificationToggle
              icon={Calendar}
              title="Event Reminders"
              description="Push notifications for upcoming events"
              checked={settings.eventReminderPush}
              onChange={(checked) => handleSettingChange('eventReminderPush', checked)}
            />
            
            <NotificationToggle
              icon={AtSign}
              title="Mentions & Replies"
              description="Instant notifications for mentions and replies"
              checked={settings.mentionPush}
              onChange={(checked) => handleSettingChange('mentionPush', checked)}
              isRecommended
            />
            
            <NotificationToggle
              icon={AlertCircle}
              title="Security Alerts"
              description="Critical security notifications"
              checked={settings.securityAlertPush}
              onChange={(checked) => handleSettingChange('securityAlertPush', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Community Specific Notifications */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardTitle className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            Community Notifications
          </CardTitle>
          <CardDescription>
            Fine-tune notifications for community features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <NotificationToggle
            icon={MessageSquare}
            title="Channel Activity"
            description="Notifications for messages in channels you've joined"
            checked={settings.channelNotifications}
            onChange={(checked) => handleSettingChange('channelNotifications', checked)}
            isRecommended
          />
          
          <NotificationToggle
            icon={Users}
            title="New Members"
            description="Get notified when new members join the community"
            checked={settings.newMemberNotifications}
            onChange={(checked) => handleSettingChange('newMemberNotifications', checked)}
          />
          
          <NotificationToggle
            icon={Volume2}
            title="Polls & Surveys"
            description="Notifications about new polls and when results are available"
            checked={settings.pollNotifications}
            onChange={(checked) => handleSettingChange('pollNotifications', checked)}
          />
          
          <NotificationToggle
            icon={Settings}
            title="Moderation Updates"
            description="Notifications about moderation actions and community guidelines"
            checked={settings.moderationNotifications}
            onChange={(checked) => handleSettingChange('moderationNotifications', checked)}
          />
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950/20 dark:to-slate-950/20">
          <CardTitle className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-gray-600" />
            Privacy & Security
          </CardTitle>
          <CardDescription>
            Control your visibility and data collection preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          <NotificationToggle
            icon={Bell}
            title="Profile Visibility"
            description="Allow others to view your profile and activity"
            checked={settings.profileVisibility}
            onChange={(checked) => handleSettingChange('profileVisibility', checked)}
          />
          
          <NotificationToggle
            icon={Volume2}
            title="Activity Status"
            description="Show when you're online and active in the community"
            checked={settings.activityStatus}
            onChange={(checked) => handleSettingChange('activityStatus', checked)}
          />
          
          <NotificationToggle
            icon={Settings}
            title="Data Collection"
            description="Allow collection of usage data to improve the platform"
            checked={settings.dataCollection}
            onChange={(checked) => handleSettingChange('dataCollection', checked)}
          />
          
          <NotificationToggle
            icon={AlertCircle}
            title="Two-Factor Authentication"
            description="Enable 2FA for enhanced account security"
            checked={settings.twoFactorAuth}
            onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
            isRecommended
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
};
