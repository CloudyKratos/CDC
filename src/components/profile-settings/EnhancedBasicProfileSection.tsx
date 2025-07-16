
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Loader2, Save, RotateCcw } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useEnhancedProfileData } from '@/hooks/useEnhancedProfileData';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import { SkillsInterestsManager } from './SkillsInterestsManager';
import { UnsavedChangesGuard } from './UnsavedChangesGuard';
import { ProfileLoadingStates } from './ProfileLoadingStates';
import { ProfileCompletionIndicator } from './ProfileCompletionIndicator';
import { EnhancedAvatarUpload } from './EnhancedAvatarUpload';
import { toast } from 'sonner';

interface EnhancedBasicProfileSectionProps {
  user?: any;
}

export const EnhancedBasicProfileSection: React.FC<EnhancedBasicProfileSectionProps> = ({ user }) => {
  const {
    profile,
    loading,
    hasUnsavedChanges,
    validationErrors,
    autoSaveEnabled,
    handleInputChange,
    handleSkillsChange,
    handleInterestsChange,
    handleAvatarChange,
    handleSaveProfile,
    resetChanges,
    toggleAutoSave,
    validateField
  } = useEnhancedProfileData(user);

  const { completionPercentage, loading: completionLoading, refreshCompletion } = useProfileCompletion(user);

  const [isSaving, setIsSaving] = useState(false);

  // Refresh completion when profile is saved
  useEffect(() => {
    if (!loading && !hasUnsavedChanges) {
      refreshCompletion();
    }
  }, [loading, hasUnsavedChanges, refreshCompletion]);

  const handleFieldChange = (field: string, value: string) => {
    handleInputChange(field, value);
    
    // Real-time validation with debouncing
    setTimeout(() => {
      const error = validateField(field, value);
      // Validation is handled in the hook
    }, 500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const success = await handleSaveProfile();
      if (success) {
        await refreshCompletion();
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
    toast.info('Changes discarded');
  };

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

      {/* Header with Auto-save Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">Profile Information</h2>
          </div>
          <p className="text-muted-foreground">Update your basic profile details and preferences.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
          <Switch
            id="auto-save"
            checked={autoSaveEnabled}
            onCheckedChange={toggleAutoSave}
          />
        </div>
      </div>

      {/* Profile Completion Indicator */}
      <ProfileCompletionIndicator 
        percentage={completionPercentage} 
        loading={completionLoading}
      />

      {/* Avatar Section */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EnhancedAvatarUpload
            currentAvatarUrl={profile.avatar_url}
            userId={user?.id}
            userName={profile.full_name}
            onAvatarChange={handleAvatarChange}
            disabled={loading}
          />
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
                className={`h-11 ${validationErrors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {validationErrors.full_name && (
                <p className="text-sm text-red-600">{validationErrors.full_name}</p>
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
                className={`h-11 ${validationErrors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {validationErrors.username && (
                <p className="text-sm text-red-600">{validationErrors.username}</p>
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
              className={`min-h-[100px] resize-none ${validationErrors.bio ? 'border-red-500 focus:border-red-500' : ''}`}
              maxLength={500}
              disabled={loading}
            />
            <div className="flex justify-between items-center">
              {validationErrors.bio && (
                <p className="text-sm text-red-600">{validationErrors.bio}</p>
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
                className={`h-11 ${validationErrors.phone_number ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {validationErrors.phone_number && (
                <p className="text-sm text-red-600">{validationErrors.phone_number}</p>
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
                className={`h-11 ${validationErrors.website ? 'border-red-500 focus:border-red-500' : ''}`}
                disabled={loading}
              />
              {validationErrors.website && (
                <p className="text-sm text-red-600">{validationErrors.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills and Interests */}
      <SkillsInterestsManager
        skills={profile.skills}
        interests={profile.interests}
        onSkillsChange={handleSkillsChange}
        onInterestsChange={handleInterestsChange}
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
              className={`h-11 ${validationErrors.github_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {validationErrors.github_url && (
              <p className="text-sm text-red-600">{validationErrors.github_url}</p>
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
              className={`h-11 ${validationErrors.linkedin_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {validationErrors.linkedin_url && (
              <p className="text-sm text-red-600">{validationErrors.linkedin_url}</p>
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
              className={`h-11 ${validationErrors.twitter_url ? 'border-red-500 focus:border-red-500' : ''}`}
              disabled={loading}
            />
            {validationErrors.twitter_url && (
              <p className="text-sm text-red-600">{validationErrors.twitter_url}</p>
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
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset Changes
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          disabled={isSaving || loading} 
          className="flex items-center gap-2 min-w-[140px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
