
import React from 'react';
import { Hash, Pin, Bell, Users, Heart, MessageSquare, Video, Sparkles, Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CommunityChannelContentProps {
  channelName: string;
}

const CommunityChannelContent: React.FC<CommunityChannelContentProps> = ({ channelName }) => {
  const channelInfo = {
    general: {
      title: "General",
      description: "General community discussion",
      iconColor: "text-blue-500",
    },
    introduction: {
      title: "Introduction",
      description: "Introduce yourself to the community",
      iconColor: "text-green-500",
    },
    "hall-of-fame": {
      title: "Hall of Fame",
      description: "Celebrate community achievements",
      iconColor: "text-yellow-500",
    },
    "round-table": {
      title: "Round Table",
      description: "Weekly community discussions",
      iconColor: "text-red-500",
    },
  };

  const currentChannel = channelInfo[channelName as keyof typeof channelInfo] || channelInfo.general;

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Hash className={`mr-2 ${currentChannel.iconColor}`} size={20} />
          <h2 className="font-medium text-lg">{currentChannel.title}</h2>
          <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
            <Pin size={10} className="mr-1" /> Featured
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                  <Bell size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Notification settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                  <Users size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Member list</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {/* Channel-specific content */}
          {channelName === "round-table" && (
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 my-6 backdrop-blur-sm">
              <div className="flex items-center">
                <Video className="text-red-500 animate-pulse mr-2" size={20} />
                <h3 className="font-medium bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Live Roundtable Discussion</h3>
                <Badge className="ml-2 bg-red-500 text-white">LIVE</Badge>
              </div>
              <p className="text-sm mt-2">The weekly community roundtable is currently active with 13 participants. Join to discuss this week's topic: "Building a successful entrepreneurial mindset".</p>
              <Button className="mt-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white">
                Join Call <Sparkles size={14} className="ml-1" />
              </Button>
            </div>
          )}

          {channelName === "hall-of-fame" && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4 my-6 backdrop-blur-sm">
              <div className="flex items-center mb-3">
                <Avatar className="h-12 w-12 border-2 border-yellow-200 dark:border-yellow-900/50 mr-3">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                  <AvatarFallback>AS</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent">Entrepreneur of the Month</h3>
                  <p className="text-sm">Alex Smith</p>
                </div>
                <Badge className="ml-auto bg-yellow-500 text-white">TOP ACHIEVER</Badge>
              </div>
              <p className="text-sm mt-2">Congratulations to Alex for successfully launching his startup and securing $1M in seed funding!</p>
              <div className="flex items-center space-x-2 mt-3">
                <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/20">
                  <Heart size={14} className="mr-1" /> Congratulate
                </Button>
                <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/20">
                  <MessageSquare size={14} className="mr-1" /> Send Message
                </Button>
              </div>
            </div>
          )}

          {/* Standard community chat messages */}
          {(channelName === "general" || channelName === "introduction") && (
            <>
              {channelName === "introduction" && (
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-900/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
                  <h3 className="font-medium bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent mb-2">
                    Welcome to the Community!
                  </h3>
                  <p className="text-sm">This is a place to introduce yourself to other entrepreneurs. Share your background, interests, and what you're working on!</p>
                </div>
              )}
            </>
          )}

          {/* Standard community messages - shown in all channels */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3 group hover:bg-gray-50 dark:hover:bg-gray-800/30 p-2 rounded-lg transition-colors">
              <Avatar className="h-8 w-8 mt-1 ring-2 ring-primary/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User${i}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-medium text-sm bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">User {i+1}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">Today at {10+i}:{Math.floor(Math.random()*60).toString().padStart(2, '0')} AM</span>
                </div>
                <p className="text-sm mt-1">
                  {channelName === "introduction" 
                    ? "Hi everyone! I'm excited to join this community. I'm working on a new project related to sustainable business practices."
                    : channelName === "hall-of-fame"
                    ? "Congratulations to all the amazing entrepreneurs who achieved their milestones this month!"
                    : channelName === "round-table"
                    ? "I think the most important aspect of entrepreneurship is resilience and adaptability."
                    : "This is a great community for entrepreneurs to share ideas and collaborate!"}
                </p>
                
                <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                    <Heart size={12} className="text-gray-500 hover:text-red-500 transition-colors" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                    <MessageSquare size={12} className="text-gray-500 hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced message input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/80">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input 
              placeholder={`Message #${channelName}...`}
              className="pr-20 rounded-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
          <Button className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-full">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChannelContent;
