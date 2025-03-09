import React, { useState } from 'react';
import { User, Camera, Mail, Phone, MapPin, Briefcase, Calendar, Edit, Save, X, Bell, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const ProfilePanel = () => {
  const [user, setUser] = useState({
    name: 'Demo User',
    email: 'user@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Passionate entrepreneur and community builder with experience in tech startups and product development.',
    occupation: 'Product Manager',
    joinDate: 'January 2023',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  
  const handleEditToggle = () => {
    if (isEditing) {
      // Discard changes
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };
  
  const handleSaveProfile = () => {
    setUser(editedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="container max-w-4xl py-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-2">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>DU</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                  onClick={() => toast.info('Avatar upload feature coming soon')}
                >
                  <Camera size={14} />
                </Button>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.occupation}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="outline" className="mb-2">Community Member</Badge>
              <div className="flex justify-center items-center text-sm text-gray-500 dark:text-gray-400">
                <Calendar size={14} className="mr-1" />
                Joined {user.joinDate}
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button 
                variant={isEditing ? "destructive" : "outline"}
                size="sm"
                onClick={handleEditToggle}
                className="w-full"
              >
                {isEditing ? (
                  <>
                    <X size={16} className="mr-1" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit size={16} className="mr-1" />
                    Edit Profile
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Connections</span>
                  <Badge variant="secondary">34</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Events Attended</span>
                  <Badge variant="secondary">7</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Roundtables</span>
                  <Badge variant="secondary">5</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column - Profile Info */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                {isEditing && (
                  <Button 
                    onClick={handleSaveProfile}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save size={16} className="mr-1" />
                    Save Changes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center">
                  <User size={14} className="mr-1 text-gray-500" />
                  Full Name
                </label>
                {isEditing ? (
                  <Input 
                    name="name"
                    value={editedUser.name}
                    onChange={handleInputChange}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-base">{user.name}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center">
                    <Mail size={14} className="mr-1 text-gray-500" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <Input 
                      name="email"
                      value={editedUser.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{user.email}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center">
                    <Phone size={14} className="mr-1 text-gray-500" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <Input 
                      name="phone"
                      value={editedUser.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{user.phone}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center">
                    <MapPin size={14} className="mr-1 text-gray-500" />
                    Location
                  </label>
                  {isEditing ? (
                    <Input 
                      name="location"
                      value={editedUser.location}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{user.location}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium flex items-center">
                    <Briefcase size={14} className="mr-1 text-gray-500" />
                    Occupation
                  </label>
                  {isEditing ? (
                    <Input 
                      name="occupation"
                      value={editedUser.occupation}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-base">{user.occupation}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Bio</label>
                {isEditing ? (
                  <Textarea 
                    name="bio"
                    value={editedUser.bio}
                    onChange={handleInputChange}
                    className="mt-1"
                    rows={4}
                  />
                ) : (
                  <p className="text-base">{user.bio}</p>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Mail size={16} className="mr-2" />
                  Email Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell size={16} className="mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield size={16} className="mr-2" />
                  Privacy & Security
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => toast.success('Successfully logged out')} className="text-red-500 hover:text-white hover:bg-red-500">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
