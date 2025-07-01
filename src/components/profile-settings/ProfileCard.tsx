
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, MapPin, Building, Shield } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface ProfileData {
  full_name: string;
  location: string;
  company: string;
  avatar_url: string;
}

interface ProfileCardProps {
  user: User;
  profile: ProfileData;
  isAdmin: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user, profile, isAdmin }) => {
  return (
    <Card className="md:col-span-1">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage 
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
              alt="Profile" 
            />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-2xl">
              {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {profile.full_name || 'Anonymous User'}
          {isAdmin && (
            <Badge className="bg-red-500 text-white">
              <Shield className="h-3 w-3 mr-1" />
              Admin
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Mail className="h-4 w-4" />
            <span>{user.email}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.company && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building className="h-4 w-4" />
              <span>{profile.company}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
