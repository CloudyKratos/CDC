
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, MapPin, Clock, Upload, User, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfileData } from '@/hooks/useProfileData';
import { useEnhancedProfileValidation } from '@/hooks/useEnhancedProfileValidation';
import { SkillsInterestsManager } from './SkillsInterestsManager';
import { UnsavedChangesGuard } from './UnsavedChangesGuard';
import { ProfileLoadingStates } from './ProfileLoadingStates';
import { toast } from 'sonner';

interface EnhancedBasicProfileSectionProps {
  user?: any;
}

export const EnhancedBasicProfileSection: React.FC<EnhancedBasicProfileSectionProps> = ({ user }) => {
  const {
    profile,
    loading,
    hasUnsavedChanges,
    handleInputChange,
    handleSaveProfile,
    resetChanges
  } = useProfileData(user);

  const {
    errors,
    validateField,
    validateForm,
    clearFieldError,
    hasErrors
  } = useEnhancedProfileValidation();

  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize skills and interests from profile data
  useEffect(() => {
    // Parse skills and interests from profile if they exist
    // This would typically come from the database
    setSkills([]);
    setInterests([]);
  }, [profile]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        toast.success('Avatar updated. Don\'t forget to save your changes!');
      };
      reader.readAsDataURL(file);
      // TODO: Implement actual upload to Supabase Storage
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    handleInputChange(field, value);
    
    // Clear field error on change
    if (errors[field]) {
      clearFieldError(field);
    }
    
    // Validate field in real-time for better UX
    const error = validateField(field, value);
    if (error) {
      setTimeout(() => {
        const currentError = validateField(field, value);
        if (currentError) {
          // Only show error if user has stopped typing for a moment
        }
      }, 1000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Validate form before saving
    const formErrors = validateForm(profile);
    if (Object.keys(formErrors).length > 0) {
      setIsSaving(false);
      toast.error('Please fix the validation errors before saving');
      return;
    }

    try {
      const success = await handleSaveProfile();
      if (success) {
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    resetChanges();
    setAvatarPreview(null);
    setSkills([]);
    setInterests([]);
    toast.info('Changes discarded');
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Madrid',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Seoul',
    'Asia/Singapore',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland'
  ];

  if (loading) {
    return <ProfileLoadingStates type="full" />;
  }

  return (
    <div className="space-y-6">
      <UnsavedChangesGuard
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onDiscard={handleDiscard}
        isSaving={isSaving}
      />

      <div>
        <div className="flex items-center gap-3 mb-2">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
        </div>
        <p className="text-muted-foreground">Update your basic profile details and preferences.</p>
      </div>

      {/* Avatar Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account. JPG, PNG up to 5MB.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
                <AvatarImage src={avatarPreview || profile.avatar_url} />
                <AvatarFallback className="text-xl bg-primary/10">
                  {profile.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold text-foreground">Change Avatar</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Click on the avatar or use the button below to upload a new picture.
              </p>
              <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
                <Upload className="h-4 w-4" />
                Upload Picture
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>
            Your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name *
              </Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className={`h-11 ${errors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => handleFieldChange('username', e.target.value)}
                placeholder="Choose a unique username"
                className={`h-11 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.username && (
                <p className="text-sm text-red-600">{errors.username}</p>
              )}
              <p className="text-xs text-muted-foreground">
                3-30 characters, letters, numbers, underscores, and hyphens only
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
              placeholder="Tell us a bit about yourself..."
              className={`min-h-[100px] resize-none ${errors.bio ? 'border-red-500 focus:border-red-500' : ''}`}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex justify-between items-center">
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio}</p>
              )}
              <p className="text-xs text-muted-foreground ml-auto">
                {profile.bio?.length || 0}/500 characters
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="City, Country"
                className="h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                Company
              </Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                placeholder="Your company or organization"
                className="h-11"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number" className="text-sm font-medium">
                Phone Number
              </Label>
              <Input
                id="phone_number"
                value={profile.phone_number}
                onChange={(e) => handleFieldChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={`h-11 ${errors.phone_number ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.phone_number && (
                <p className="text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website
              </Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className={`h-11 ${errors.website ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {errors.website && (
                <p className="text-sm text-red-600">{errors.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills and Interests */}
      <SkillsInterestsManager
        skills={skills}
        interests={interests}
        onSkillsChange={setSkills}
        onInterestsChange={setInterests}
        disabled={loading}
      />

      {/* Social Links */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Social Links</CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github_url" className="text-sm font-medium">
              GitHub Profile
            </Label>
            <Input
              id="github_url"
              value={profile.github_url}
              onChange={(e) => handleFieldChange('github_url', e.target.value)}
              placeholder="https://github.com/yourusername"
              className={`h-11 ${errors.github_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.github_url && (
              <p className="text-sm text-red-600">{errors.github_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="text-sm font-medium">
              LinkedIn Profile
            </Label>
            <Input
              id="linkedin_url"
              value={profile.linkedin_url}
              onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourusername"
              className={`h-11 ${errors.linkedin_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.linkedin_url && (
              <p className="text-sm text-red-600">{errors.linkedin_url}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="text-sm font-medium">
              Twitter/X Profile
            </Label>
            <Input
              id="twitter_url"
              value={profile.twitter_url}
              onChange={(e) => handleFieldChange('twitter_url', e.target.value)}
              placeholder="https://twitter.com/yourusername"
              className={`h-11 ${errors.twitter_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {errors.twitter_url && (
              <p className="text-sm text-red-600">{errors.twitter_url}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex justify-end gap-3 pt-6">
        {hasUnsavedChanges && (
          <Button 
            variant="outline" 
            onClick={handleDiscard}
            disabled={isSaving}
          >
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || hasErrors || loading} 
          className="flex items-center gap-2 min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
};
