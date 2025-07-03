
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Crown, Shield } from 'lucide-react';

interface ChatUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  is_typing: boolean;
}

interface UserListSidebarProps {
  users: ChatUser[];
  className?: string;
}

export const UserListSidebar: React.FC<UserListSidebarProps> = ({
  users,
  className = ''
}) => {
  const onlineUsers = users.filter(user => user.is_online);
  const offlineUsers = users.filter(user => !user.is_online);

  const UserItem = ({ user }: { user: ChatUser }) => (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url || ''} alt={user.username} />
          <AvatarFallback className="text-xs">
            {user.username[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
          user.is_online ? 'bg-green-500' : 'bg-gray-400'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium theme-text-primary truncate">
            {user.full_name || user.username}
          </span>
          {user.is_typing && (
            <div className="flex gap-0.5">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        <span className="text-xs theme-text-muted">
          {user.is_online ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );

  return (
    <Card className={`${className} theme-card`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Members ({users.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onlineUsers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm font-medium theme-text-muted">
                Online ({onlineUsers.length})
              </span>
            </div>
            <div className="space-y-1">
              {onlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        
        {offlineUsers.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full" />
              <span className="text-sm font-medium theme-text-muted">
                Offline ({offlineUsers.length})
              </span>
            </div>
            <div className="space-y-1">
              {offlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}
        
        {users.length === 0 && (
          <div className="text-center py-8 theme-text-muted">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users online</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
