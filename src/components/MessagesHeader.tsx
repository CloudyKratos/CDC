
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icons from '@/utils/IconUtils';

export interface MessagesHeaderProps {
  title: string;
  status?: string;
  avatar: string;
  isOnline?: boolean;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({ title, status, avatar, isOnline }) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 border-b dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="flex items-center">
        <div className="relative mr-3">
          <Avatar>
            <AvatarImage src={avatar} alt={title} />
            <AvatarFallback>{title[0]}</AvatarFallback>
          </Avatar>
          {isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900"></span>
          )}
        </div>
        <div>
          <h2 className="font-semibold">{title}</h2>
          {status && <p className="text-xs text-muted-foreground">{status}</p>}
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        <Button variant="ghost" size="icon">
          <Icons.Phone size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Icons.Video size={18} />
        </Button>
        <Button variant="ghost" size="icon">
          <Icons.Search size={18} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icons.MoreHorizontal size={18} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Icons.Pin size={16} className="mr-2" />
              Pin conversation
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.Bell size={16} className="mr-2" />
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icons.Trash size={16} className="mr-2" />
              Delete chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MessagesHeader;
