
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  AtSign, 
  Smartphone,
  Bell
} from 'lucide-react';

interface NotificationPreferencesSectionProps {
  user?: any;
}

export const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({ user }) => {
  const [emailNotifications, setEmailNotifications] = useState({
    directMessages: user?.email_notifications?.direct_messages ?? true,
    eventReminders: user?.email_notifications?.event_reminders ?? true,
    communityMentions: user?.email_notifications?.community_mentions ?? true,
    securityAlerts: user?.email_notifications?.security_alerts ?? true,
    productUpdates: user?.email_notifications?.product_updates ?? false,
    marketingEmails: user?.email_notifications?.marketing_emails ?? false
  });

  const [pushNotifications, setPushNotifications] = useState({
    directMessages: user?.push_notifications?.direct_messages ?? true,
    eventReminders: user?.push_notifications?.event_reminders ?? true,
    communityActivity: user?.push_notifications?.community_activity ?? false,
    securityAlerts: user?.push_notifications?.security_alerts ?? true
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase
      // await supabase.from('user_preferences').upsert({
      //   user_id: user.id,
      //   email_notifications: emailNotifications,
      //   push_notifications: pushNotifications
      // });
      console.log('Saving notification preferences:', { emailNotifications, pushNotifications });
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground">Choose how and when you want to be notified.</p>
      </div>

      {/* Email Notifications */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Email Notifications</h3>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            icon={MessageSquare}
            title="Direct Messages"
            description="Get notified when someone sends you a direct message"
            checked={emailNotifications.directMessages}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, directMessages: checked }))}
          />
          
          <NotificationToggle
            icon={Calendar}
            title="Event Reminders"
            description="Receive reminders about upcoming events you're interested in"
            checked={emailNotifications.eventReminders}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, eventReminders: checked }))}
          />
          
          <NotificationToggle
            icon={AtSign}
            title="Community Mentions"
            description="Get notified when someone mentions you in community discussions"
            checked={emailNotifications.communityMentions}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, communityMentions: checked }))}
          />
          
          <NotificationToggle
            icon={Bell}
            title="Security Alerts"
            description="Important security notifications about your account"
            checked={emailNotifications.securityAlerts}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, securityAlerts: checked }))}
          />
          
          <NotificationToggle
            icon={Bell}
            title="Product Updates"
            description="News about new features and platform updates"
            checked={emailNotifications.productUpdates}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, productUpdates: checked }))}
          />
          
          <NotificationToggle
            icon={Mail}
            title="Marketing Emails"
            description="Promotional content and special offers"
            checked={emailNotifications.marketingEmails}
            onChange={(checked) => setEmailNotifications(prev => ({ ...prev, marketingEmails: checked }))}
          />
        </div>
      </Card>

      {/* Push Notifications */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Smartphone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Push Notifications</h3>
        </div>

        <div className="space-y-4">
          <NotificationToggle
            icon={MessageSquare}
            title="Direct Messages"
            description="Instant notifications for new direct messages"
            checked={pushNotifications.directMessages}
            onChange={(checked) => setPushNotifications(prev => ({ ...prev, directMessages: checked }))}
          />
          
          <NotificationToggle
            icon={Calendar}
            title="Event Reminders"
            description="Push notifications for upcoming events"
            checked={pushNotifications.eventReminders}
            onChange={(checked) => setPushNotifications(prev => ({ ...prev, eventReminders: checked }))}
          />
          
          <NotificationToggle
            icon={Bell}
            title="Community Activity"
            description="Notifications for community posts and discussions"
            checked={pushNotifications.communityActivity}
            onChange={(checked) => setPushNotifications(prev => ({ ...prev, communityActivity: checked }))}
          />
          
          <NotificationToggle
            icon={Bell}
            title="Security Alerts"
            description="Critical security notifications"
            checked={pushNotifications.securityAlerts}
            onChange={(checked) => setPushNotifications(prev => ({ ...prev, securityAlerts: checked }))}
          />
        </div>
      </Card>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </div>
    </div>
  );
};
