
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera, X, Edit, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  timezone?: string;
}

const ProfilePanel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : {
      id: '1',
      name: 'Demo User',
      email: 'user@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
      bio: 'Product designer and developer based in SF.',
      role: 'Beta Tester',
      status: 'online',
      timezone: 'Pacific Time (PT)'
    };
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<UserProfile>(user);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
  const handleSaveProfile = () => {
    setUser(editedUser);
    localStorage.setItem('user', JSON.stringify(editedUser));
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };
  
  const handleAvatarSave = () => {
    if (newAvatarUrl) {
      const updatedUser = { ...editedUser, avatar: newAvatarUrl };
      setEditedUser(updatedUser);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Avatar updated');
    }
    setIsAvatarDialogOpen(false);
    setNewAvatarUrl('');
  };
  
  const statusOptions = [
    { value: 'online', label: 'Online', color: 'bg-green-500' },
    { value: 'away', label: 'Away', color: 'bg-yellow-500' },
    { value: 'busy', label: 'Busy', color: 'bg-red-500' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500' }
  ];
  
  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="text-xl font-semibold">Profile</h2>
        {!isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Edit size={16} className="mr-1" /> Edit
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <X size={16} className="mr-1" /> Cancel
          </Button>
        )}
      </div>
      
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <Avatar className="h-24 w-24 border-2 border-border">
              <img 
                src={user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} 
                alt={user.name}
                className="object-cover"
              />
            </Avatar>
            {isEditing && (
              <button 
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1 rounded-full"
                onClick={() => setIsAvatarDialogOpen(true)}
              >
                <Camera size={16} />
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-medium">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.role || 'Beta Tester'}</p>
            <div className="flex items-center justify-center mt-1">
              <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${statusOptions.find(s => s.value === user.status)?.color || 'bg-gray-500'}`}></span>
              <span className="text-xs text-muted-foreground">
                {statusOptions.find(s => s.value === user.status)?.label || 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        {!isEditing ? (
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
              <p>{user.email}</p>
            </div>
            
            {user.bio && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Bio</h4>
                <p className="text-sm">{user.bio}</p>
              </div>
            )}
            
            {user.timezone && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Timezone</h4>
                <p className="text-sm">{user.timezone}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium mb-1 block">Name</label>
              <Input 
                id="name" 
                value={editedUser.name} 
                onChange={e => setEditedUser({...editedUser, name: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
              <Input 
                id="email" 
                type="email" 
                value={editedUser.email} 
                onChange={e => setEditedUser({...editedUser, email: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea 
                id="bio" 
                value={editedUser.bio || ''} 
                onChange={e => setEditedUser({...editedUser, bio: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="text-sm font-medium mb-1 block">Role</label>
              <Input 
                id="role" 
                value={editedUser.role || ''} 
                onChange={e => setEditedUser({...editedUser, role: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="status" className="text-sm font-medium mb-1 block">Status</label>
              <select 
                id="status"
                value={editedUser.status || 'offline'}
                onChange={e => setEditedUser({...editedUser, status: e.target.value as 'online' | 'away' | 'busy' | 'offline'})}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="timezone" className="text-sm font-medium mb-1 block">Timezone</label>
              <Input 
                id="timezone" 
                value={editedUser.timezone || ''} 
                onChange={e => setEditedUser({...editedUser, timezone: e.target.value})}
              />
            </div>
            
            <div className="pt-4">
              <Button onClick={handleSaveProfile} className="w-full">Save Profile</Button>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-border">
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full"
            onClick={() => setIsConfirmLogoutOpen(true)}
          >
            <LogOut size={16} className="mr-2" /> Log Out
          </Button>
        </div>
      </div>
      
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Avatar</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="avatar-url" className="text-sm font-medium mb-1 block">Avatar URL</label>
            <Input 
              id="avatar-url" 
              placeholder="https://example.com/avatar.png" 
              value={newAvatarUrl} 
              onChange={e => setNewAvatarUrl(e.target.value)}
            />
            
            {newAvatarUrl && (
              <div className="mt-4 flex justify-center">
                <Avatar className="h-20 w-20">
                  <img 
                    src={newAvatarUrl} 
                    alt="New avatar" 
                    className="object-cover"
                    onError={() => {
                      toast.error('Invalid image URL');
                      setNewAvatarUrl('');
                    }}
                  />
                </Avatar>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAvatarDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAvatarSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isConfirmLogoutOpen} onOpenChange={setIsConfirmLogoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to log out?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmLogoutOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePanel;
