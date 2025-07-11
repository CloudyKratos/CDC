
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, User, Bell, Shield, Palette, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { useRole } from '@/contexts/RoleContext';
import { ProfileCard } from '@/components/profile-settings/ProfileCard';
import { ProfileTab } from '@/components/profile-settings/ProfileTab';
import { AppearanceTab } from '@/components/profile-settings/AppearanceTab';
import { EnhancedNotificationsTab } from '@/components/profile-settings/EnhancedNotificationsTab';
import { PrivacyTab } from '@/components/profile-settings/PrivacyTab';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const EnhancedProfileSettings = () => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  const {
    profile,
    settings,
    loading,
    hasUnsavedChanges,
    validationErrors,
    handleInputChange,
    handleSettingChange,
    handleSaveProfile,
    handleSaveSettings,
    resetChanges
  } = useEnhancedProfileData(user as unknown as SupabaseUser);

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

  const tabConfig = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Personal information and bio' },
    { id: 'appearance', label: 'Appearance', icon: Palette, description: 'Theme and display settings' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Notification preferences' },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield, description: 'Privacy and account settings' },
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences and settings</p>
          </div>
          {hasUnsavedChanges && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetChanges}>
                Discard Changes
              </Button>
              <Button onClick={activeTab === 'profile' ? handleSaveProfile : handleSaveSettings}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <ProfileCard 
              user={user as unknown as SupabaseUser} 
              profile={profile} 
              isAdmin={isAdmin} 
            />
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                {/* Tab Navigation */}
                <div className="border-b bg-muted/30 p-6 pb-0">
                  <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
                    {tabConfig.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id} 
                          value={tab.id} 
                          className="flex flex-col gap-1 h-auto py-3 data-[state=active]:bg-background"
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs font-medium">{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  
                  {/* Tab Description */}
                  <div className="mt-4 pb-4">
                    <p className="text-sm text-muted-foreground">
                      {tabConfig.find(tab => tab.id === activeTab)?.description}
                    </p>
                  </div>
                </div>

                <CardContent className="p-6">
                  <TabsContent value="profile" className="mt-0">
                    <ProfileTab
                      profile={profile}
                      loading={loading}
                      validationErrors={validationErrors}
                      onInputChange={handleInputChange}
                      onSave={handleSaveProfile}
                    />
                  </TabsContent>

                  <TabsContent value="appearance" className="mt-0">
                    <AppearanceTab />
                  </TabsContent>

                  <TabsContent value="notifications" className="mt-0">
                    <EnhancedNotificationsTab
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
    </div>
  );
};

export default EnhancedProfileSettings;
