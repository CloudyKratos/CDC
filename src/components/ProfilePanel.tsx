
import React, { useContext, useState } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  User, 
  Settings, 
  Shield, 
  Bell, 
  Moon, 
  Sun, 
  Palette, 
  Lock, 
  LifeBuoy, 
  LogOut,
  Mail,
  Calendar,
  Clock,
  Edit,
  Save,
  X,
  Check,
  UserCircle,
  MessageSquare
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePanel = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [colorTheme, setColorTheme] = useState(localStorage.getItem('colorTheme') || 'blue');
  const [isEditing, setIsEditing] = useState(false);
  
  const [profileData, setProfileData] = useState({
    displayName: user?.name || "Demo User",
    bio: "UI/UX Designer and Developer based in San Francisco. I love creating beautiful and functional interfaces.",
    website: "example.com",
    location: "San Francisco, CA",
    timeZone: "PST (UTC-8)",
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: true,
    soundEnabled: true,
    darkMode: darkMode,
    colorTheme: colorTheme,
    twoFactorEnabled: false,
    autoStatus: true
  });
  
  // Activity data (mock)
  const activityData = [
    { id: 1, type: "message", content: "Posted in General channel", time: "2 hours ago" },
    { id: 2, type: "event", content: "Joined Weekly Roundtable event", time: "Yesterday" },
    { id: 3, type: "login", content: "Logged in from new device", time: "3 days ago" },
    { id: 4, type: "upload", content: "Uploaded file: project-proposal.pdf", time: "1 week ago" },
    { id: 5, type: "message", content: "Commented on Alex's post", time: "1 week ago" },
  ];
  
  const handleLogout = () => {
    toast.success("Successfully logged out");
    logout();
    navigate("/login");
  };
  
  const handleToggleDarkMode = () => {
    const newDarkMode = !settings.darkMode;
    setSettings({ ...settings, darkMode: newDarkMode });
    setDarkMode(newDarkMode);
    
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };
  
  const handleColorThemeChange = (theme: string) => {
    setSettings({ ...settings, colorTheme: theme });
    setColorTheme(theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('theme-blue', 'theme-purple', 'theme-green', 'theme-orange');
    // Add the new theme class
    document.documentElement.classList.add(`theme-${theme}`);
    localStorage.setItem('colorTheme', theme);
  };
  
  const handleEditProfile = () => {
    if (isEditing) {
      // Save changes
      toast.success("Profile updated successfully");
    }
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl animate-fade-in">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-3 h-12 glass-card">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
          
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="glass-card">
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-800 shadow-md">
                    <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} />
                    <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "DU"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{user?.name || "Demo User"}</CardTitle>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-500 dark:bg-purple-500/20 border-purple-500/30">
                        {user?.role || "Beta Tester"}
                      </Badge>
                    </div>
                    <CardDescription>{user?.email || "user@example.com"}</CardDescription>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        <Calendar className="h-3 w-3 mr-1" />
                        Joined April 2023
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditProfile}
                  className="self-start md:self-center"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <UserCircle className="h-4 w-4" />
                      About
                    </h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="displayName">Display Name</Label>
                          <Input 
                            id="displayName" 
                            name="displayName" 
                            value={profileData.displayName} 
                            onChange={handleInputChange} 
                            className="form-input-modern"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Input 
                            id="bio" 
                            name="bio" 
                            value={profileData.bio} 
                            onChange={handleInputChange} 
                            className="form-input-modern"
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Mail className="h-4 w-4" />
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input 
                              id="website" 
                              name="website" 
                              value={profileData.website} 
                              onChange={handleInputChange} 
                              className="form-input-modern"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input 
                              id="location" 
                              name="location" 
                              value={profileData.location} 
                              onChange={handleInputChange} 
                              className="form-input-modern"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="flex items-center gap-2">
                            <span className="font-medium w-24">Email:</span>
                            <span>{user?.email || "user@example.com"}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium w-24">Website:</span>
                            <span>{profileData.website}</span>
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="font-medium w-24">Location:</span>
                            <span>{profileData.location}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Clock className="h-4 w-4" />
                      Time Zone
                    </h3>
                    {isEditing ? (
                      <div className="space-y-2">
                        <Label htmlFor="timeZone">Time Zone</Label>
                        <Input 
                          id="timeZone" 
                          name="timeZone" 
                          value={profileData.timeZone} 
                          onChange={handleInputChange} 
                          className="form-input-modern"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {profileData.timeZone}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4" />
                      Recent Activity
                    </h3>
                    <div className="space-y-3">
                      {activityData.map(activity => (
                        <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            activity.type === 'message' 
                              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                              : activity.type === 'event'
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : activity.type === 'login'
                              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>
                            {activity.type === 'message' ? <MessageSquare size={16} /> :
                             activity.type === 'event' ? <Calendar size={16} /> :
                             activity.type === 'login' ? <User size={16} /> :
                             <Calendar size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{activity.content}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Shield className="h-4 w-4" />
                      Security Overview
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Two-factor authentication</span>
                        </div>
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                          Not enabled
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Last password change</span>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                          2 weeks ago
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6 space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">General Settings</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications" className="flex-1">
                        Email notifications
                      </Label>
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="desktopNotifications" className="flex-1">
                        Desktop notifications
                      </Label>
                      <Switch
                        id="desktopNotifications"
                        checked={settings.desktopNotifications}
                        onCheckedChange={(checked) => setSettings({ ...settings, desktopNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="soundEnabled" className="flex-1">
                        Sound effects
                      </Label>
                      <Switch
                        id="soundEnabled"
                        checked={settings.soundEnabled}
                        onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="darkMode" className="flex items-center gap-2">
                          <span>Dark Mode</span>
                        </Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Switch between light and dark mode
                        </p>
                      </div>
                      <div className="flex items-center border rounded-full p-1 bg-gray-100 dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => !settings.darkMode && handleToggleDarkMode()}
                          className={`p-1.5 rounded-full ${!settings.darkMode ? 'bg-white shadow-sm dark:bg-gray-700' : ''}`}
                        >
                          <Sun className="h-4 w-4 text-amber-500" />
                        </button>
                        <button
                          type="button"
                          onClick={() => settings.darkMode && handleToggleDarkMode()}
                          className={`p-1.5 rounded-full ${settings.darkMode ? 'bg-gray-700 shadow-sm' : ''}`}
                        >
                          <Moon className="h-4 w-4 text-indigo-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <Label className="block mb-3">Color Theme</Label>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => handleColorThemeChange('blue')}
                          className={`h-10 w-10 rounded-full bg-blue-500 ${settings.colorTheme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                        >
                          {settings.colorTheme === 'blue' && <Check className="h-5 w-5 text-white mx-auto" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleColorThemeChange('purple')}
                          className={`h-10 w-10 rounded-full bg-purple-500 ${settings.colorTheme === 'purple' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`}
                        >
                          {settings.colorTheme === 'purple' && <Check className="h-5 w-5 text-white mx-auto" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleColorThemeChange('green')}
                          className={`h-10 w-10 rounded-full bg-green-500 ${settings.colorTheme === 'green' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`}
                        >
                          {settings.colorTheme === 'green' && <Check className="h-5 w-5 text-white mx-auto" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleColorThemeChange('orange')}
                          className={`h-10 w-10 rounded-full bg-orange-500 ${settings.colorTheme === 'orange' ? 'ring-2 ring-offset-2 ring-orange-500' : ''}`}
                        >
                          {settings.colorTheme === 'orange' && <Check className="h-5 w-5 text-white mx-auto" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Status & Presence
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoStatus" className="flex-1">
                        Automatically update status
                      </Label>
                      <Switch
                        id="autoStatus"
                        checked={settings.autoStatus}
                        onCheckedChange={(checked) => setSettings({ ...settings, autoStatus: checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6 space-y-6 animate-fade-in">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-xl">Security Settings</CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-1">
                      <p className="font-medium">Add an extra layer of security</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Protect your account with an additional verification step
                      </p>
                    </div>
                    <Button variant="outline">
                      {settings.twoFactorEnabled ? "Manage" : "Enable"}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Password</h3>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="space-y-1">
                      <p className="font-medium">Change your password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Last updated 2 weeks ago
                      </p>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Current session</p>
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                            Active
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          San Francisco, CA • Chrome on macOS
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="space-y-1">
                        <p className="font-medium">Mobile App</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          iOS • Last active 2 days ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Revoke
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-medium">Account Danger Zone</h3>
                  <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20">
                    <h4 className="font-medium text-red-600 dark:text-red-400">Delete account</h4>
                    <p className="text-sm text-red-500/80 dark:text-red-400/80 mt-1">
                      This action is permanent and cannot be undone. All your data will be permanently deleted.
                    </p>
                    <Button variant="destructive" size="sm" className="mt-3 bg-red-600 hover:bg-red-700">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePanel;
