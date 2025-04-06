
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera, User, Settings, Bell, LogOut, Shield, Key,
  Mail, Globe, Phone, MapPin, Edit, Save, Calendar, Briefcase,
  Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import ProfilePanel from "./ProfilePanel";

const UserProfilePanel: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'User',
    bio: '',
    location: '',
    website: '',
    timeZone: 'Pacific Time (UTC-8)',
    phoneNumber: '',
    role: user?.role || 'user',
    company: "Creator's Hub"
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch profile data from Supabase
  useEffect(() => {
    async function fetchProfileData() {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfileData(prev => ({
            ...prev,
            name: data.full_name || user?.name || 'User',
            bio: data.bio || prev.bio,
            location: data.location || prev.location,
            website: data.website || prev.website,
          }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setProfileLoading(false);
      }
    }
    
    fetchProfileData();
  }, [user?.id]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Update user in auth context
      await updateUser({
        ...user,
        name: profileData.name,
      });
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 space-y-6 h-full overflow-y-auto">
      <ProfilePanel />
      
      <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-primary/10 profile-card">
        <CardHeader className="relative">
          <div className="absolute right-4 top-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Edit size={14} />
                  Edit Cover
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Cover Image</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center">
                    <Camera size={48} className="text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Drop your image here or click to browse
                    </p>
                  </div>
                  <Button>Upload Cover Image</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="relative mb-10">
            <div className="w-full h-28 rounded-t-lg bg-gradient-to-r from-blue-400 to-purple-500"></div>
            <div className="absolute -bottom-10 left-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background">
                  <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} />
                  <AvatarFallback className="text-xl">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white dark:bg-gray-800"
                >
                  <Camera size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          <CardTitle className="flex items-center gap-2 mt-6">
            {profileData.name}
            {user?.role === "admin" && (
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </CardTitle>
          <CardDescription>{profileData.role} at {profileData.company}</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-4">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="flex justify-between">
                <h3 className="text-lg font-medium">Personal Information</h3>
                {!isEditingProfile ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingProfile(true)}
                    className="gap-1"
                  >
                    <Edit size={14} />
                    Edit Profile
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleProfileUpdate}
                    className="gap-1"
                    disabled={isSaving}
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} />}
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>
              
              {!isEditingProfile ? (
                <>
                  <div className="grid gap-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.email || 'user@example.com'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.phoneNumber || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.location || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.website || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.timeZone}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium mb-2">Bio</h4>
                    <p className="text-sm text-muted-foreground">
                      {profileData.bio || 'No bio available. Edit your profile to add one.'}
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      name="name"
                      value={profileData.name} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={user?.email || 'user@example.com'} 
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Contact support to change your email</p>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phoneNumber"
                      value={profileData.phoneNumber} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      name="location"
                      value={profileData.location} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      name="website"
                      value={profileData.website} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Input 
                      id="timezone" 
                      name="timeZone"
                      value={profileData.timeZone} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio"
                      value={profileData.bio} 
                      onChange={handleInputChange} 
                      rows={4}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <h3 className="text-lg font-medium">Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Enable dark mode for the interface</p>
                  </div>
                  <Switch id="darkMode" checked={document.documentElement.classList.contains('dark')} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifs">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch id="emailNotifs" defaultChecked={user?.preferences?.emailNotifications ?? true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="desktopNotifs">Desktop Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive desktop notifications</p>
                  </div>
                  <Switch id="desktopNotifs" defaultChecked={user?.preferences?.desktopNotifications ?? true} />
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings size={16} />
                    Advanced Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security" className="space-y-6">
              <h3 className="text-lg font-medium">Security Settings</h3>
              
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2" 
                  onClick={async () => {
                    try {
                      await supabase.auth.updateUser({ password: prompt('Enter new password:') || '' });
                      toast.success('Password updated successfully');
                    } catch (error) {
                      console.error('Error updating password:', error);
                      toast.error('Failed to update password');
                    }
                  }}
                >
                  <Key size={16} />
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield size={16} />
                  Two-Factor Authentication
                </Button>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="loginAlerts">Login Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get alerted when someone logs in from a new device</p>
                  </div>
                  <Switch id="loginAlerts" defaultChecked />
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start gap-2"
                    onClick={async () => {
                      try {
                        await supabase.auth.signOut({ scope: 'global' });
                        toast.success('Signed out from all devices');
                      } catch (error) {
                        console.error('Error signing out:', error);
                        toast.error('Failed to sign out from all devices');
                      }
                    }}
                  >
                    <LogOut size={16} />
                    Sign Out from All Devices
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePanel;
