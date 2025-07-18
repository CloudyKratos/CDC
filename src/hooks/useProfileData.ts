
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  full_name: string;
  username: string;
  bio: string;
  location: string;
  company: string;
  phone_number: string;
  website: string;
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  avatar_url: string;
}

interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  profileVisibility: boolean;
  activityStatus: boolean;
  dataCollection: boolean;
  twoFactorAuth: boolean;
}

export const useProfileData = (user: User | null) => {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
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

  const [settings, setSettings] = useState<UserSettings>({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    profileVisibility: true,
    activityStatus: true,
    dataCollection: true,
    twoFactorAuth: false
  });

  const [originalProfile, setOriginalProfile] = useState<ProfileData>({ ...profile });
  const [originalSettings, setOriginalSettings] = useState<UserSettings>({ ...settings });

  // Track changes
  useEffect(() => {
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasUnsavedChanges(profileChanged || settingsChanged);
  }, [profile, settings, originalProfile, originalSettings]);

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
        const profileData = {
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
        };
        setProfile(profileData);
        setOriginalProfile(profileData);
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
        const settingsData = {
          emailNotifications: data.email_notifications ?? true,
          pushNotifications: data.push_notifications ?? true,
          marketingEmails: data.marketing_emails ?? false,
          profileVisibility: data.profile_visibility ?? true,
          activityStatus: data.activity_status ?? true,
          dataCollection: data.data_collection ?? true,
          twoFactorAuth: data.two_factor_auth ?? false
        };
        setSettings(settingsData);
        setOriginalSettings(settingsData);
      } else {
        console.log('No settings found, using defaults');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveProfile = async (): Promise<boolean> => {
    if (!user) return false;

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

      setOriginalProfile({ ...profile });
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (): Promise<boolean> => {
    if (!user) return false;

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

      setOriginalSettings({ ...settings });
      toast.success('Settings updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings. Please try again.');
      return false;
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

  const resetChanges = () => {
    setProfile({ ...originalProfile });
    setSettings({ ...originalSettings });
    setHasUnsavedChanges(false);
  };

  return {
    profile,
    settings,
    loading,
    hasUnsavedChanges,
    handleInputChange,
    handleSettingChange,
    handleSaveProfile,
    handleSaveSettings,
    resetChanges
  };
};
