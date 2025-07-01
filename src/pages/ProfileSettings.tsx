
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';
import { ProfileCard } from '@/components/profile-settings/ProfileCard';
import { ProfileTab } from '@/components/profile-settings/ProfileTab';
import { AppearanceTab } from '@/components/profile-settings/AppearanceTab';
import { NotificationsTab } from '@/components/profile-settings/NotificationsTab';
import { PrivacyTab } from '@/components/profile-settings/PrivacyTab';
import { useProfileData } from '@/hooks/useProfileData';
import type { User } from '@supabase/supabase-js';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();
  
  const {
    profile,
    settings,
    loading,
    handleInputChange,
    handleSettingChange,
    handleSaveProfile,
    handleSaveSettings
  } = useProfileData(user as User);

  const isAdmin = currentRole === 'admin';

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
          <ProfileCard user={user as User} profile={profile} isAdmin={isAdmin} />

          {/* Settings Tabs */}
          <Card className="md:col-span-3">
            <Tabs defaultValue="profile" className="w-full">
              <div className="p-6 pb-0">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                </TabsList>
              </div>

              <CardContent className="p-6">
                <TabsContent value="profile" className="mt-0">
                  <ProfileTab
                    profile={profile}
                    loading={loading}
                    onInputChange={handleInputChange}
                    onSave={handleSaveProfile}
                  />
                </TabsContent>

                <TabsContent value="appearance" className="mt-0">
                  <AppearanceTab />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <NotificationsTab
                    settings={settings}
                    loading={loading}
                    onSettingChange={handleSettingChange}
                    onSave={handleSaveSettings}
                  />
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <PrivacyTab
                    settings={settings}
                    loading={loading}
                    onSettingChange={handleSettingChange}
                    onSave={handleSaveSettings}
                    onLogout={handleLogout}
                    onDeleteAccount={handleDeleteAccount}
                  />
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
