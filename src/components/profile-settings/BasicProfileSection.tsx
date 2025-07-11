
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, MapPin, Clock, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicProfileSectionProps {
  user?: any;
}

export const BasicProfileSection: React.FC<BasicProfileSectionProps> = ({ user }) => {
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // TODO: Upload to Supabase Storage
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrate with Supabase
      // await supabase.from('profiles').update(profileData).eq('id', user.id);
      console.log('Saving profile data:', profileData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    // Add more timezones as needed
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Profile Information</h2>
        <p className="text-muted-foreground">Update your basic profile details and avatar.</p>
      </div>

      {/* Avatar Section */}
      <Card className="p-6 bg-gradient-to-r from-muted/30 to-muted/10 border-border/50">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
              <AvatarImage src={avatarPreview || user?.avatar_url} />
              <AvatarFallback className="text-xl bg-primary/10">
                {profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
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
            />
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-foreground">Profile Picture</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Click on the avatar to upload a new picture. JPG, PNG up to 5MB.
            </p>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Change Avatar
            </Button>
          </div>
        </div>
      </Card>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
          <Input
            id="fullName"
            value={profileData.fullName}
            onChange={(e) => setProfileData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter your full name"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">Username</Label>
          <Input
            id="username"
            value={profileData.username}
            onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
            placeholder="Choose a unique username"
            className="h-11"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
        <Textarea
          id="bio"
          value={profileData.bio}
          onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
          placeholder="Tell us a bit about yourself..."
          className="min-h-[100px] resize-none"
          maxLength={160}
        />
        <p className="text-xs text-muted-foreground text-right">
          {profileData.bio.length}/160 characters
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location
          </Label>
          <Input
            id="location"
            value={profileData.location}
            onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="City, Country"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timezone
          </Label>
          <Select value={profileData.timezone} onValueChange={(value) => 
            setProfileData(prev => ({ ...prev, timezone: value }))
          }>
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button 
          onClick={handleSave}
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};
