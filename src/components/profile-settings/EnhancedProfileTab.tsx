
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Github, Linkedin, Twitter, Globe, AlertCircle, Upload } from 'lucide-react';

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

interface EnhancedProfileTabProps {
  profile: ProfileData;
  loading: boolean;
  hasUnsavedChanges: boolean;
  validationErrors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export const EnhancedProfileTab: React.FC<EnhancedProfileTabProps> = ({
  profile,
  loading,
  hasUnsavedChanges,
  validationErrors,
  onInputChange,
  onSave,
  onReset
}) => {
  const getInputClassName = (field: string) => {
    return validationErrors[field] ? "border-red-500 focus:border-red-500" : "";
  };

  return (
    <div className="space-y-6">
      {hasUnsavedChanges && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You have unsaved changes</span>
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset Changes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Picture</CardTitle>
          <CardDescription>
            Upload a profile picture to personalize your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-500">
                  {profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                <Upload className="h-4 w-4" />
                Upload Picture
              </Button>
              <p className="text-xs text-muted-foreground">
                Avatar upload coming soon! For now, we'll generate one from your name.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>
            Your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => onInputChange('full_name', e.target.value)}
                placeholder="Enter your full name"
                className={getInputClassName('full_name')}
              />
              {validationErrors.full_name && (
                <p className="text-sm text-red-600">{validationErrors.full_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={profile.username}
                onChange={(e) => onInputChange('username', e.target.value)}
                placeholder="Choose a unique username"
                className={getInputClassName('username')}
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
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => onInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {profile.bio.length}/500 characters
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => onInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => onInputChange('company', e.target.value)}
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
                onChange={(e) => onInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className={getInputClassName('phone_number')}
              />
              {validationErrors.phone_number && (
                <p className="text-sm text-red-600">{validationErrors.phone_number}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => onInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className={getInputClassName('website')}
              />
              {validationErrors.website && (
                <p className="text-sm text-red-600">{validationErrors.website}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Links</CardTitle>
          <CardDescription>
            Connect your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="github_url" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              GitHub
            </Label>
            <Input
              id="github_url"
              value={profile.github_url}
              onChange={(e) => onInputChange('github_url', e.target.value)}
              placeholder="https://github.com/yourusername"
              className={getInputClassName('github_url')}
            />
            {validationErrors.github_url && (
              <p className="text-sm text-red-600">{validationErrors.github_url}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin_url" className="flex items-center gap-2">
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Label>
            <Input
              id="linkedin_url"
              value={profile.linkedin_url}
              onChange={(e) => onInputChange('linkedin_url', e.target.value)}
              placeholder="https://linkedin.com/in/yourusername"
              className={getInputClassName('linkedin_url')}
            />
            {validationErrors.linkedin_url && (
              <p className="text-sm text-red-600">{validationErrors.linkedin_url}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="twitter_url" className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              Twitter
            </Label>
            <Input
              id="twitter_url"
              value={profile.twitter_url}
              onChange={(e) => onInputChange('twitter_url', e.target.value)}
              placeholder="https://twitter.com/yourusername"
              className={getInputClassName('twitter_url')}
            />
            {validationErrors.twitter_url && (
              <p className="text-sm text-red-600">{validationErrors.twitter_url}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-6">
        {hasUnsavedChanges && (
          <Button variant="outline" onClick={onReset}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={onSave} 
          disabled={loading || Object.keys(validationErrors).length > 0} 
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
};
