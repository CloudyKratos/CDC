
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Circle } from 'lucide-react';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface UserListSidebarProps {
  users: User[];
  className?: string;
}

export const UserListSidebar: React.FC<UserListSidebarProps> = ({
  users,
  className = ''
}) => {
  const onlineUsers = users.filter(u => u.is_online);
  const offlineUsers = users.filter(u => !u.is_online);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const UserItem: React.FC<{ user: User }> = ({ user }) => {
    const displayName = user.full_name || user.username || 'Unknown User';
    
    return (
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div className="relative">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
            <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <Circle 
            className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
              user.is_online 
                ? 'fill-green-500 text-green-500' 
                : 'fill-gray-400 text-gray-400'
            }`}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium theme-text-primary truncate">
            {displayName}
          </p>
          {user.username && user.username !== displayName && (
            <p className="text-xs theme-text-secondary truncate">
              @{user.username}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className={`h-full theme-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Members
          <Badge variant="secondary" className="ml-auto">
            {users.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {onlineUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium theme-text-primary mb-2 flex items-center gap-2">
              <Circle className="h-3 w-3 fill-green-500 text-green-500" />
              Online ({onlineUsers.length})
            </h4>
            <div className="space-y-1">
              {onlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {offlineUsers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium theme-text-primary mb-2 flex items-center gap-2">
              <Circle className="h-3 w-3 fill-gray-400 text-gray-400" />
              Offline ({offlineUsers.length})
            </h4>
            <div className="space-y-1">
              {offlineUsers.map(user => (
                <UserItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-8 theme-text-secondary">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users online</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
