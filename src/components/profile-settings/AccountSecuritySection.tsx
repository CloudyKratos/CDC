
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  CheckCircle, 
  AlertCircle,
  Smartphone
} from 'lucide-react';

interface AccountSecuritySectionProps {
  user?: any;
}

export const AccountSecuritySection: React.FC<AccountSecuritySectionProps> = ({ user }) => {
  const [securityData, setSecurityData] = useState({
    email: user?.email || '',
    phone: user?.phone || '',
    twoFactorEnabled: user?.two_factor_enabled || false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase Auth
      // await supabase.auth.resend({ type: 'email', email: securityData.email });
      console.log('Sending verification email');
    } catch (error) {
      console.error('Error sending verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase Auth for phone verification
      console.log('Sending phone verification');
    } catch (error) {
      console.error('Error sending phone verification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase Auth
      // await supabase.auth.updateUser({ password: passwordData.newPassword });
      console.log('Changing password');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase for 2FA
      console.log('Toggling 2FA:', enabled);
      setSecurityData(prev => ({ ...prev, twoFactorEnabled: enabled }));
    } catch (error) {
      console.error('Error toggling 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Account & Security</h2>
        <p className="text-muted-foreground">Manage your login credentials and security settings.</p>
      </div>

      {/* Email Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Email Address</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-foreground">{securityData.email}</span>
            {user?.email_confirmed_at ? (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Verified
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                Unverified
              </Badge>
            )}
          </div>
          
          {!user?.email_confirmed_at && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSendVerification}
              disabled={isLoading}
            >
              Send Verification
            </Button>
          )}
        </div>
      </Card>

      {/* Phone Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Phone Number</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              type="tel"
              value={securityData.phone}
              onChange={(e) => setSecurityData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
              className="h-11"
            />
          </div>
          <Button 
            variant="outline"
            onClick={handlePhoneVerification}
            disabled={isLoading || !securityData.phone}
          >
            Verify Phone
          </Button>
        </div>
      </Card>

      {/* Password Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Password</h3>
          </div>
          <Button 
            variant="outline"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            Change Password
          </Button>
        </div>

        {showPasswordForm && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handlePasswordChange}
                disabled={isLoading || !passwordData.currentPassword || !passwordData.newPassword}
              >
                Update Password
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowPasswordForm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Two-Factor Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <Switch
            checked={securityData.twoFactorEnabled}
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>

        {securityData.twoFactorEnabled && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <Smartphone className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Authenticator App Enabled</p>
                <p className="text-sm text-muted-foreground">
                  You're using an authenticator app for two-factor authentication
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
