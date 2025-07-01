
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Github, Linkedin, Twitter } from 'lucide-react';

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

interface ProfileTabProps {
  profile: ProfileData;
  loading: boolean;
  onInputChange: (field: string, value: string) => void;
  onSave: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  loading,
  onInputChange,
  onSave
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => onInputChange('full_name', e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => onInputChange('username', e.target.value)}
              placeholder="Choose a username"
            />
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
          />
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
              placeholder="Your phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => onInputChange('website', e.target.value)}
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
                onChange={(e) => onInputChange('github_url', e.target.value)}
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
                onChange={(e) => onInputChange('linkedin_url', e.target.value)}
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
                onChange={(e) => onInputChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/yourusername"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={onSave} disabled={loading} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </div>
  );
};
