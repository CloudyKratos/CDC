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
import { Badge } from "@/components/ui/badge";
import {
  Camera, User, Settings, Bell, LogOut, Shield, Key,
  Mail, Globe, Phone, MapPin, Edit, Save, Calendar, Briefcase,
  Loader2, Trophy, Target, Star, CheckCircle, AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";

interface ProfileData {
  name: string;
  bio: string;
  location: string;
  website: string;
  timeZone: string;
  phoneNumber: string;
  role: string;
  company: string;
  skills: string[];
  interests: string[];
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
  };
}

const UserProfilePanel: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { progress } = useWarriorProgress();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    bio: '',
    location: '',
    website: '',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    phoneNumber: '',
    role: user?.role || 'user',
    company: "",
    skills: [],
    interests: [],
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: ''
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Fetch profile data from Supabase
  useEffect(() => {
    async function fetchProfileData() {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }
      
      try {
        setProfileError(null);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
          setProfileError('Failed to load profile data');
          return;
        }
        
        if (data) {
          setProfileData(prev => ({
            ...prev,
            name: data.full_name || user?.name || '',
            bio: data.bio || '',
            location: data.location || '',
            website: data.website || '',
            phoneNumber: data.phone_number || '',
            company: data.company || '',
            skills: Array.isArray(data.skills) ? data.skills : [],
            interests: Array.isArray(data.interests) ? data.interests : [],
            socialLinks: {
              twitter: data.twitter_url || '',
              linkedin: data.linkedin_url || '',
              github: data.github_url || ''
            }
          }));
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setProfileError('An unexpected error occurred');
      } finally {
        setProfileLoading(false);
      }
    }
    
    fetchProfileData();
  }, [user?.id, user?.name]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setProfileError(null);
    
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
          phone_number: profileData.phoneNumber,
          company: profileData.company,
          skills: profileData.skills,
          interests: profileData.interests,
          twitter_url: profileData.socialLinks.twitter,
          linkedin_url: profileData.socialLinks.linkedin,
          github_url: profileData.socialLinks.github,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      setIsEditingProfile(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setProfileError('Failed to update profile');
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const [, socialPlatform] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialPlatform]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Error Loading Profile</h3>
            <p className="text-muted-foreground mt-2">{profileError}</p>
          </div>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in p-4 space-y-6 h-full overflow-y-auto">
      {/* Profile Header Card */}
      <Card className="backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-primary/20 shadow-lg">
        <CardHeader className="relative pb-2">
          {/* Cover Image Section */}
          <div className="relative mb-16">
            <div className="w-full h-32 rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 right-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30">
                      <Camera size={14} />
                      Edit Cover
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Cover Image</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center bg-muted/30">
                        <Camera size={48} className="text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Cover image uploads coming soon!<br />
                          For now, enjoy this beautiful gradient.
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {/* Profile Avatar */}
            <div className="absolute -bottom-12 left-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-background shadow-lg"
                >
                  <Camera size={14} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{profileData.name || 'Anonymous User'}</CardTitle>
                {user?.role === "admin" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {progress && progress.level >= 5 && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                    <Star className="h-3 w-3 mr-1" />
                    Warrior
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                {profileData.company && ` at ${profileData.company}`}
              </CardDescription>
              {profileData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {profileData.location}
                </div>
              )}
            </div>
            
            {/* Warrior Stats */}
            {progress && (
              <div className="flex gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-primary">{progress.level}</div>
                  <div className="text-xs text-muted-foreground">Level</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-orange-500">{progress.streak}</div>
                  <div className="text-xs text-muted-foreground">Streak</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-green-500">{progress.completedQuests}</div>
                  <div className="text-xs text-muted-foreground">Quests</div>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="profile" className="flex-1">Profile</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {!isEditingProfile ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditingProfile(true)}
                    className="gap-2"
                  >
                    <Edit size={14} />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleProfileUpdate}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>
              
              {!isEditingProfile ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{user?.email || 'No email provided'}</span>
                    </div>
                    {profileData.phoneNumber && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profileData.phoneNumber}</span>
                      </div>
                    )}
                    {profileData.website && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                          {profileData.website}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.timeZone}</span>
                    </div>
                  </div>
                  
                  {/* Bio */}
                  {profileData.bio && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Bio</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed p-3 bg-muted/50 rounded-lg">
                        {profileData.bio}
                      </p>
                    </div>
                  )}
                  
                  {/* Skills */}
                  {profileData.skills.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Interests */}
                  {profileData.interests.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Interests</h4>
                      <div className="flex flex-wrap gap-2">
                        {profileData.interests.map((interest, index) => (
                          <Badge key={index} variant="outline">{interest}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={profileData.name} 
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input 
                        id="company" 
                        name="company"
                        value={profileData.company} 
                        onChange={handleInputChange}
                        placeholder="Your company or organization"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      name="bio"
                      value={profileData.bio} 
                      onChange={handleInputChange} 
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        name="location"
                        value={profileData.location} 
                        onChange={handleInputChange}
                        placeholder="City, Country"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input 
                        id="website" 
                        name="website"
                        value={profileData.website} 
                        onChange={handleInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phoneNumber"
                      value={profileData.phoneNumber} 
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  {/* Skills Management */}
                  <div className="space-y-3">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      />
                      <Button type="button" onClick={addSkill} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {skill}
                          <button 
                            onClick={() => removeSkill(skill)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Interests Management */}
                  <div className="space-y-3">
                    <Label>Interests</Label>
                    <div className="flex gap-2">
                      <Input 
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        placeholder="Add an interest"
                        onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                      />
                      <Button type="button" onClick={addInterest} size="sm">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.interests.map((interest, index) => (
                        <Badge key={index} variant="outline" className="gap-1">
                          {interest}
                          <button 
                            onClick={() => removeInterest(interest)}
                            className="ml-1 hover:text-destructive"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div className="space-y-3">
                    <Label>Social Links</Label>
                    <div className="grid gap-3">
                      <Input 
                        name="social.twitter"
                        value={profileData.socialLinks.twitter}
                        onChange={handleInputChange}
                        placeholder="Twitter profile URL"
                      />
                      <Input 
                        name="social.linkedin"
                        value={profileData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        placeholder="LinkedIn profile URL"
                      />
                      <Input 
                        name="social.github"
                        value={profileData.socialLinks.github}
                        onChange={handleInputChange}
                        placeholder="GitHub profile URL"
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="space-y-6">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              
              {progress && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Trophy className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Current Level</p>
                          <p className="text-2xl font-bold text-primary">{progress.level}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                          <Target className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-medium">Total XP</p>
                          <p className="text-2xl font-bold text-orange-500">{progress.totalXp}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium">Completed Quests</p>
                          <p className="text-2xl font-bold text-green-500">{progress.completedQuests}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <Star className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-medium">Current Streak</p>
                          <p className="text-2xl font-bold text-red-500">{progress.streak} days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Detailed activity timeline coming soon!</p>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <h3 className="text-lg font-semibold">Account Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifs">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
                  </div>
                  <Switch id="emailNotifs" defaultChecked={user?.preferences?.emailNotifications ?? true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifs">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                  <Switch id="pushNotifs" defaultChecked={user?.preferences?.pushNotifications ?? true} />
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label htmlFor="profileVisibility">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                  </div>
                  <Switch id="profileVisibility" defaultChecked={true} />
                </div>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Key size={16} />
                  Change Password
                </Button>
                
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Shield size={16} />
                  Privacy Settings
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start gap-2"
                  onClick={async () => {
                    try {
                      await supabase.auth.signOut({ scope: 'global' });
                      toast.success('Signed out successfully');
                    } catch (error) {
                      console.error('Error signing out:', error);
                      toast.error('Failed to sign out');
                    }
                  }}
                >
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePanel;
