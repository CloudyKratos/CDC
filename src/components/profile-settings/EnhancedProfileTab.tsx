
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, Github, Linkedin, Twitter, AlertCircle } from 'lucide-react';

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
  validationErrors: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const EnhancedProfileTab: React.FC<EnhancedProfileTabProps> = ({
  profile,
  loading,
  validationErrors,
  onInputChange,
  onSave
}) => {
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        
        {hasErrors && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fix the following errors before saving:
              <ul className="mt-2 list-disc list-inside text-sm">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              className={validationErrors.full_name ? 'border-destructive' : ''}
            />
            {validationErrors.full_name && (
              <p className="text-sm text-destructive">{validationErrors.full_name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => onInputChange('username', e.target.value)}
              placeholder="Choose a username"
              className={validationErrors.username ? 'border-destructive' : ''}
            />
            {validationErrors.username && (
              <p className="text-sm text-destructive">{validationErrors.username}</p>
            )}
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
            className={validationErrors.bio ? 'border-destructive' : ''}
          />
          {validationErrors.bio && (
            <p className="text-sm text-destructive">{validationErrors.bio}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={profile.location}
              onChange={(e) => onInputChange('location', e.target.value)}
              placeholder="City, Country"
              className={validationErrors.location ? 'border-destructive' : ''}
            />
            {validationErrors.location && (
              <p className="text-sm text-destructive">{validationErrors.location}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={profile.company}
              onChange={(e) => onInputChange('company', e.target.value)}
              placeholder="Your company"
              className={validationErrors.company ? 'border-destructive' : ''}
            />
            {validationErrors.company && (
              <p className="text-sm text-destructive">{validationErrors.company}</p>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={profile.phone_number}
              onChange={(e) => onInputChange('phone_number', e.target.value)}
              placeholder="Your phone number"
              className={validationErrors.phone_number ? 'border-destructive' : ''}
            />
            {validationErrors.phone_number && (
              <p className="text-sm text-destructive">{validationErrors.phone_number}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => onInputChange('website', e.target.value)}
              placeholder="https://yourwebsite.com"
              className={validationErrors.website ? 'border-destructive' : ''}
            />
            {validationErrors.website && (
              <p className="text-sm text-destructive">{validationErrors.website}</p>
            )}
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
                onChange={(e) => onInputChange('github_url', e.target.value)}
                placeholder="https://github.com/yourusername"
                className={validationErrors.github_url ? 'border-destructive' : ''}
              />
              {validationErrors.github_url && (
                <p className="text-sm text-destructive">{validationErrors.github_url}</p>
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
                className={validationErrors.linkedin_url ? 'border-destructive' : ''}
              />
              {validationErrors.linkedin_url && (
                <p className="text-sm text-destructive">{validationErrors.linkedin_url}</p>
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
                className={validationErrors.twitter_url ? 'border-destructive' : ''}
              />
              {validationErrors.twitter_url && (
                <p className="text-sm text-destructive">{validationErrors.twitter_url}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button 
            onClick={onSave} 
            disabled={loading || hasErrors} 
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};
