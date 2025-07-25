
import { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useFormAutoSave } from './useFormAutoSave';

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
  skills: string[];
  interests: string[];
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

export const useEnhancedProfileData = (user: User | null) => {
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  
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
    avatar_url: '',
    skills: [],
    interests: []
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

  // Auto-save functionality
  const { triggerAutoSave } = useFormAutoSave({
    onSave: handleSaveProfile,
    delay: 3000,
    enabled: autoSaveEnabled && hasUnsavedChanges
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSettings();
    }
  }, [user]);

  // Track changes
  useEffect(() => {
    const profileChanged = JSON.stringify(profile) !== JSON.stringify(originalProfile);
    const settingsChanged = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    const newHasUnsavedChanges = profileChanged || settingsChanged;
    
    setHasUnsavedChanges(newHasUnsavedChanges);
    
    // Trigger auto-save when changes are detected
    if (newHasUnsavedChanges && autoSaveEnabled) {
      triggerAutoSave();
    }
  }, [profile, settings, originalProfile, originalSettings, autoSaveEnabled, triggerAutoSave]);

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'username':
        if (value && (value.length < 3 || value.length > 30)) {
          return 'Username must be between 3 and 30 characters';
        }
        if (value && !/^[a-zA-Z0-9_-]+$/.test(value)) {
          return 'Username can only contain letters, numbers, underscores, and hyphens';
        }
        break;
      case 'website':
      case 'github_url':
      case 'linkedin_url':
      case 'twitter_url':
        if (value && !isValidUrl(value)) {
          return 'Please enter a valid URL';
        }
        break;
      case 'phone_number':
        if (value && !/^\+?[\d\s\-\(\)]{10,}$/.test(value)) {
          return 'Please enter a valid phone number';
        }
        break;
      case 'full_name':
        if (value && value.length > 100) {
          return 'Name must be less than 100 characters';
        }
        break;
      case 'bio':
        if (value && value.length > 500) {
          return 'Bio must be less than 500 characters';
        }
        break;
    }
    return '';
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const fetchProfile = async () => {
    if (!user) return;

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
          avatar_url: data.avatar_url || '',
          skills: Array.isArray(data.skills) ? data.skills.map(skill => String(skill)) : [],
          interests: Array.isArray(data.interests) ? data.interests.map(interest => String(interest)) : []
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
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  async function handleSaveProfile(): Promise<boolean> {
    if (!user) return false;

    // Validate all fields
    const errors: Record<string, string> = {};
    Object.entries(profile).forEach(([key, value]) => {
      if (typeof value === 'string') {
        const error = validateField(key, value);
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix validation errors before saving');
      return false;
    }

    setValidationErrors({});
    setLoading(true);

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
      
      if (!autoSaveEnabled) {
        toast.success('Profile updated successfully!');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (): Promise<boolean> => {
    if (!user) return false;

    setLoading(true);
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

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSkillsChange = (skills: string[]) => {
    setProfile(prev => ({
      ...prev,
      skills
    }));
  };

  const handleInterestsChange = (interests: string[]) => {
    setProfile(prev => ({
      ...prev,
      interests
    }));
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setProfile(prev => ({
      ...prev,
      avatar_url: avatarUrl || ''
    }));
  };

  const resetChanges = () => {
    setProfile({ ...originalProfile });
    setSettings({ ...originalSettings });
    setValidationErrors({});
    setHasUnsavedChanges(false);
  };

  const toggleAutoSave = () => {
    setAutoSaveEnabled(!autoSaveEnabled);
    toast.info(autoSaveEnabled ? 'Auto-save disabled' : 'Auto-save enabled');
  };

  return {
    profile,
    settings,
    loading,
    hasUnsavedChanges,
    validationErrors,
    autoSaveEnabled,
    handleInputChange,
    handleSettingChange,
    handleSkillsChange,
    handleInterestsChange,
    handleAvatarChange,
    handleSaveProfile,
    handleSaveSettings,
    resetChanges,
    toggleAutoSave,
    validateField
  };
};
