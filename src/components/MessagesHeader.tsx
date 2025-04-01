
import React, { useState } from "react";
import { Search, Filter, Bell, Settings, Phone, Video, Users, Hash, Info, Link2, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessagesHeaderProps {
  channelType: string;
  participants?: { id: string; name: string; avatar?: string; status?: string }[];
  title?: string;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({ 
  channelType, 
  participants = [], 
  title = channelType.charAt(0).toUpperCase() + channelType.slice(1)
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const isDirectMessage = channelType === "direct";
  const isActive = isDirectMessage && participants.some(p => p.status === "online");
  
  return (
    <div className="border-b border-border p-4 flex flex-col space-y-3 sticky top-0 bg-background/95 backdrop-blur-sm z-20 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isDirectMessage ? (
            <>
              <div className="flex -space-x-2">
                {participants.slice(0, 3).map((participant, index) => (
                  <Avatar key={participant.id} className="border-2 border-background relative shadow-sm hover:scale-105 transition-transform">
                    <AvatarImage src={participant.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`} />
                    <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                    {index === 0 && participant.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-pulse"></span>
                    )}
                  </Avatar>
                ))}
                {participants.length > 3 && (
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border-2 border-background text-xs font-medium shadow-sm">
                    +{participants.length - 3}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-base">
                  {participants.length > 0 
                    ? participants.map(p => p.name).join(", ") 
                    : "New Message"}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center">
                  {isActive ? (
                    <>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block mr-1 animate-pulse"></span>
                      Active now
                    </>
                  ) : (
                    "Offline"
                  )}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/30 text-primary shadow-sm">
                <span className="text-lg font-medium">#</span>
              </div>
              <div>
                <h3 className="font-medium text-base flex items-center">
                  {title}
                  {channelType === "general" && (
                    <Badge className="ml-2 bg-primary/10 text-primary border-0 text-xs shadow-sm">Community</Badge>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {channelType === "general" 
                    ? "Welcome to the general discussion channel" 
                    : channelType === "introduction" 
                    ? "Introduce yourself to the community" 
                    : channelType === "hall-of-fame" 
                    ? "Showcase your achievements" 
                    : "Join our community discussions"}
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          {isDirectMessage ? (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Phone size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start audio call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Video size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start video call</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Info size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Channel information</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                      <Users size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Member list</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors">
                <Settings size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-md animate-in zoom-in-50 duration-150">
              <DropdownMenuLabel>Chat Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notification Preferences</span>
                </DropdownMenuItem>
                {isDirectMessage ? (
                  <>
                    <DropdownMenuItem>
                      <Video className="mr-2 h-4 w-4" />
                      <span>Start Video Call</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Phone className="mr-2 h-4 w-4" />
                      <span>Start Audio Call</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link2 className="mr-2 h-4 w-4" />
                      <span>Create Shared Link</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Message Filters</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>Invite Others</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Hash className="mr-2 h-4 w-4" />
                      <span>Channel Settings</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                <span>Leave {isDirectMessage ? "Conversation" : "Channel"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`Search in ${isDirectMessage ? "conversation" : "channel"}...`}
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9 bg-muted/50 border-none focus-visible:ring-primary/20 transition-all shadow-sm hover:bg-muted/70"
        />
      </div>
    </div>
  );
};

export default MessagesHeader;
