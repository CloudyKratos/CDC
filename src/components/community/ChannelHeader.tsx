
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Hash, 
  Users, 
  Bell, 
  Pin,
  Search,
  AtSign,
  HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChannelHeaderProps {
  channelName: string;
  channelDescription?: string;
  memberCount?: number;
  onToggleMembersList?: () => void;
  showMembersList?: boolean;
}

const ChannelHeader: React.FC<ChannelHeaderProps> = ({
  channelName,
  channelDescription = "Community discussions",
  memberCount = 0,
  onToggleMembersList,
  showMembersList = true
}) => {
  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="flex items-center">
        <Hash className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-1" />
        <span className="font-semibold">{channelName}</span>
        
        <Separator orientation="vertical" className="mx-2 h-5" />
        
        <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline">
          {channelDescription}
        </span>
      </div>
      
      <div className="flex items-center space-x-1">
        <TooltipProvider>
          {channelName === 'global-connect' && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="mr-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                  Global
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a global channel</p>
              </TooltipContent>
            </Tooltip>
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pin size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pinned Messages</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <AtSign size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Mentions</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Search</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={onToggleMembersList}
              >
                <Users size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{showMembersList ? "Hide" : "Show"} Member List ({memberCount})</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle size={18} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ChannelHeader;
