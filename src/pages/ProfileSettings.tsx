
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  MapPin, 
  Building, 
  Globe, 
  Github, 
  Linkedin, 
  Twitter, 
  Shield,
  Settings,
  Bell,
  Eye,
  Lock,
  Palette,
  Moon,
  Sun,
  Trash2,
  LogOut
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';
import { useTheme } from 'next-themes';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    company: '',
    phone_number: '',
    website: '',
    github_url: '',
    linkedin_url: '',
    twitter_url: '',
    avatar_url: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    profileVisibility: true,
    activityStatus: true,
    dataCollection: true,
    twoFactorAuth: false
  });

  const isAdmin = currentRole === 'admin';

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSettings();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    console.log('Fetching profile for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          company: data.company || '',
          phone_number: data.phone_number || '',
          website: data.website || '',
          github_url: data.github_url || '',
          linkedin_url: data.linkedin_url || '',
          twitter_url: data.twitter_url || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;

    console.log('Fetching settings for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        console.log('Settings fetched:', data);
        setSettings({
          emailNotifications: data.email_notifications ?? true,
          pushNotifications: data.push_notifications ?? true,
          marketingEmails: data.marketing_emails ?? false,
          profileVisibility: data.profile_visibility ?? true,
          activityStatus: data.activity_status ?? true,
          dataCollection: data.data_collection ?? true,
          twoFactorAuth: data.two_factor_auth ?? false
        });
      } else {
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    console.log('Saving profile for user:', user.id);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    console.log('Saving settings for user:', user.id);
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

      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      // In a real app, you'd want to handle this server-side
      toast.error('Account deletion is not yet implemented. Please contact support.');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage 
                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                    alt="Profile" 
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
                    {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="flex items-center justify-center gap-2">
                {profile.full_name || 'Anonymous User'}
                {isAdmin && (
                  <Badge className="bg-red-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                {profile.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.company && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Building className="h-4 w-4" />
                    <span>{profile.company}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Card className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Profile Tab */}
                <TabsContent value="profile" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={profile.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          placeholder="Choose a username"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profile.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          value={profile.phone_number}
                          onChange={(e) => handleInputChange('phone_number', e.target.value)}
                          placeholder="Your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={profile.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="text-md font-medium">Social Links</h4>
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="github_url" className="flex items-center gap-2">
                            <Github className="h-4 w-4" />
                            GitHub
                          </Label>
                          <Input
                            id="github_url"
                            value={profile.github_url}
                            onChange={(e) => handleInputChange('github_url', e.target.value)}
                            placeholder="https://github.com/yourusername"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </Label>
                          <Input
                            id="linkedin_url"
                            value={profile.linkedin_url}
                            onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                            placeholder="https://linkedin.com/in/yourusername"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="twitter_url" className="flex items-center gap-2">
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </Label>
                          <Input
                            id="twitter_url"
                            value={profile.twitter_url}
                            onChange={(e) => handleInputChange('twitter_url', e.target.value)}
                            placeholder="https://twitter.com/yourusername"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button onClick={handleSaveProfile} disabled={loading} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Profile'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Appearance Tab */}
                <TabsContent value="appearance" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
                    
                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            <Label>Theme</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Choose your preferred color theme
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={theme === 'light' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('light')}
                            className="flex items-center gap-2"
                          >
                            <Sun className="h-4 w-4" />
                            Light
                          </Button>
                          <Button
                            variant={theme === 'dark' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('dark')}
                            className="flex items-center gap-2"
                          >
                            <Moon className="h-4 w-4" />
                            Dark
                          </Button>
                          <Button
                            variant={theme === 'system' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTheme('system')}
                          >
                            System
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Preview</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          This is how your interface will look with the current theme settings.
                        </p>
                        <div className="flex gap-2">
                          <div className="h-8 w-8 rounded bg-primary"></div>
                          <div className="h-8 w-8 rounded bg-secondary"></div>
                          <div className="h-8 w-8 rounded bg-accent"></div>
                          <div className="h-8 w-8 rounded bg-muted"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            <Label>Email Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in your browser
                          </p>
                        </div>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Marketing Emails</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive marketing and promotional emails
                          </p>
                        </div>
                        <Switch
                          checked={settings.marketingEmails}
                          onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Notifications'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Privacy Tab */}
                <TabsContent value="privacy" className="space-y-6">
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
                          onCheckedChange={(checked) => handleSettingChange('profileVisibility', checked)}
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
                          onCheckedChange={(checked) => handleSettingChange('activityStatus', checked)}
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
                          onCheckedChange={(checked) => handleSettingChange('dataCollection', checked)}
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
                          onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                        />
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-destructive">Danger Zone</h4>
                      
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-start gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                        
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          className="w-full justify-start gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <Button onClick={handleSaveSettings} disabled={loading} className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        {loading ? 'Saving...' : 'Save Privacy Settings'}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
