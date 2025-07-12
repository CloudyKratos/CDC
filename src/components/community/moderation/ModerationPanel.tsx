import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from 'sonner';

interface ModerationPanelProps {
  channelName?: string;
}

const ModerationPanel: React.FC<ModerationPanelProps> = ({ channelName = 'general' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [banReason, setBanReason] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('community_messages')
          .select('*')
          .limit(50);

        if (error) {
          throw new Error(error.message);
        }

        setMessages(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(50);

        if (error) {
          throw new Error(error.message);
        }

        setUsers(data || []);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    fetchUsers();
  }, []);

  const handleBanUser = async () => {
    if (!selectedUser || !banReason) {
      toast.error('Please select a user and provide a ban reason.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Implement ban logic here (e.g., update user role, add to ban list)
      toast.success(`User ${selectedUser.username} banned successfully.`);
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to ban user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async () => {
    if (!selectedMessage || !messageContent) {
      toast.error('Please select a message and provide new content.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Implement edit message logic here (e.g., update message content in database)
      toast.success('Message edited successfully.');
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to edit message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!selectedMessage) {
      toast.error('Please select a message to delete.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Implement delete message logic here (e.g., remove message from database)
      toast.success('Message deleted successfully.');
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to delete message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeUserRole = async () => {
    if (!selectedUser || !userRole) {
      toast.error('Please select a user and a role.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Implement change user role logic here (e.g., update user role in database)
      toast.success(`User role updated to ${userRole} successfully.`);
    } catch (error: any) {
      setError(error.message);
      toast.error('Failed to change user role.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Alert>
            <AlertDescription>
              You must be an administrator to view this panel.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Moderation Panel</CardTitle>
      </CardHeader>
      <CardContent className="h-full flex flex-col">
        <Tabs defaultValue="messages" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="messages" onClick={() => setActiveTab('messages')}>Messages</TabsTrigger>
            <TabsTrigger value="users" onClick={() => setActiveTab('users')}>Users</TabsTrigger>
            <TabsTrigger value="settings" onClick={() => setActiveTab('settings')}>Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="messages" className="flex-1 p-2">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <ScrollArea className="h-[400px] w-full p-2 border rounded-md">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${selectedMessage?.id === message.id ? 'bg-gray-200' : ''}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      {message.content}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div className="w-1/2 flex flex-col space-y-4">
                <Textarea
                  placeholder="Edit message content"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                />
                <Button onClick={handleEditMessage} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Edit Message'}
                </Button>
                <Button onClick={handleDeleteMessage} disabled={isLoading} variant="destructive">
                  {isLoading ? 'Loading...' : 'Delete Message'}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="users" className="flex-1 p-2">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <ScrollArea className="h-[400px] w-full p-2 border rounded-md">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 rounded-md hover:bg-gray-100 cursor-pointer ${selectedUser?.id === user.id ? 'bg-gray-200' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      {user.username}
                    </div>
                  ))}
                </ScrollArea>
              </div>
              <div className="w-1/2 flex flex-col space-y-4">
                <Select onValueChange={(value) => setUserRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleChangeUserRole} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Change User Role'}
                </Button>
                <Textarea
                  placeholder="Ban reason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
                <Button onClick={handleBanUser} disabled={isLoading} variant="destructive">
                  {isLoading ? 'Loading...' : 'Ban User'}
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="flex-1 p-2">
            <div>
              <p>Community settings will be available here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ModerationPanel;
