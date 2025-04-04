
import React, { useState } from 'react';
import { Hash, Pin, Bell, Users, Heart, MessageSquare, Video, Sparkles, Send, Share2, FileText, Link, Smile, Gift, Award } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CommunityChannelContentProps {
  channelName: string;
}

const CommunityChannelContent: React.FC<CommunityChannelContentProps> = ({ channelName }) => {
  const [showRichFeatures, setShowRichFeatures] = useState(false);
  const [message, setMessage] = useState('');
  const [likedMessages, setLikedMessages] = useState<string[]>([]);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  
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
  
  // User messages for the demo
  const messages = [
    {
      id: "msg1",
      user: {
        id: "user1",
        name: "Alex Johnson",
        avatar: "Alex",
        role: "Admin",
        badge: "Founder"
      },
      content: channelName === "introduction" 
        ? "Hi everyone! I'm excited to join this community. I'm working on a new project related to sustainable business practices."
        : channelName === "hall-of-fame"
        ? "Congratulations to all the amazing entrepreneurs who achieved their milestones this month!"
        : channelName === "round-table"
        ? "I think the most important aspect of entrepreneurship is resilience and adaptability."
        : "This is a great community for entrepreneurs to share ideas and collaborate!",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      pinned: channelName === "general",
      reactions: {
        "👍": 5,
        "🔥": 3,
        "💯": 2
      }
    },
    {
      id: "msg2",
      user: {
        id: "user2",
        name: "Emily Davis",
        avatar: "Emily",
        role: "Member",
        badge: "Investor"
      },
      content: channelName === "introduction" 
        ? "Hello! I'm a marketing specialist with experience in growth hacking strategies for startups."
        : channelName === "hall-of-fame"
        ? "I just closed my first funding round of $500k! Thanks to everyone who provided advice along the way."
        : channelName === "round-table"
        ? "Finding the right co-founder is critical. Someone who complements your skills and shares your vision."
        : "Has anyone used no-code tools to validate their MVP? Any recommendations?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      pinned: false,
      reactions: {
        "🎉": 8,
        "👏": 4
      }
    },
    {
      id: "msg3",
      user: {
        id: "user3",
        name: "Michael Brown",
        avatar: "Michael",
        role: "Moderator",
        badge: "Mentor"
      },
      content: channelName === "introduction" 
        ? "Welcome to all the new members! Feel free to reach out if you need any help getting oriented."
        : channelName === "hall-of-fame"
        ? "Excited to announce that my startup was featured in TechCrunch last week! The power of good PR!"
        : channelName === "round-table"
        ? "Market validation before building is essential. I've seen too many startups build something nobody wants."
        : "Just shared a resource on funding strategies in the resources channel. Check it out!",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      pinned: false,
      reactions: {
        "💡": 6,
        "💪": 3
      },
      hasAttachment: channelName !== "introduction"
    }
  ];
  
  const handleLikeToggle = (messageId: string) => {
    setLikedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };
  
  const toggleReactionPanel = (messageId: string | null) => {
    setShowReactions(messageId);
  };
  
  const renderReactionLabel = (count: number) => {
    return count > 0 ? count.toString() : "";
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
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
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-yellow-200 dark:border-yellow-900/50 mr-3">
                    <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" />
                    <AvatarFallback>AS</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-500 rounded-full p-1">
                    <Award className="h-3 w-3 text-white" />
                  </div>
                </div>
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
                <Button size="sm" variant="outline" className="text-yellow-500 border-yellow-200 hover:bg-yellow-50 dark:border-yellow-800 dark:hover:bg-yellow-900/20">
                  <Gift size={14} className="mr-1" /> Send Gift
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
          {messages.map((message) => (
            <div key={message.id} className={cn(
              "flex items-start space-x-3 group hover:bg-gray-50 dark:hover:bg-gray-800/30 p-3 rounded-lg transition-colors",
              message.pinned && "border-l-2 border-amber-500 pl-3 bg-amber-50/30 dark:bg-amber-900/10"
            )}>
              <Avatar className="h-9 w-9 mt-1 ring-2 ring-primary/10">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user.avatar}`} />
                <AvatarFallback>{message.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center flex-wrap">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium text-sm bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent cursor-pointer">
                          {message.user.name}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 p-1">
                          <p className="text-xs font-semibold">{message.user.name}</p>
                          <p className="text-xs text-gray-500">Role: {message.user.role}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {message.user.badge && (
                    <Badge variant="outline" className="ml-2 text-xs h-5 bg-primary/10 text-primary border-primary/20">
                      {message.user.badge}
                    </Badge>
                  )}
                  
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {format(message.timestamp, "h:mm a")}
                  </span>
                  
                  {message.pinned && (
                    <Badge variant="outline" className="ml-2 text-xs h-5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                      <Pin size={10} className="mr-1" /> Pinned
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm mt-1">
                  {message.content}
                </p>
                
                {message.hasAttachment && (
                  <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md p-2 bg-gray-50 dark:bg-gray-800/50 flex items-center">
                    <FileText className="h-4 w-4 text-blue-500 mr-2" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">Funding_Strategies_2025.pdf</p>
                      <p className="text-xs text-gray-500">2.4 MB · PDF</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <Link className="h-3 w-3 mr-1" />
                      <span className="text-xs">Open</span>
                    </Button>
                  </div>
                )}
                
                {/* Reactions */}
                {Object.keys(message.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(message.reactions).map(([emoji, count]) => (
                      <Badge
                        key={emoji}
                        variant="outline"
                        className={cn(
                          "text-xs py-0 h-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors",
                          likedMessages.includes(`${message.id}-${emoji}`) && "bg-primary/10 text-primary border-primary/20"
                        )}
                        onClick={() => handleLikeToggle(`${message.id}-${emoji}`)}
                      >
                        {emoji} {renderReactionLabel(count + (likedMessages.includes(`${message.id}-${emoji}`) ? 1 : 0))}
                      </Badge>
                    ))}
                    <Badge
                      variant="outline"
                      className="text-xs py-0 h-6 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      onClick={() => toggleReactionPanel(message.id)}
                    >
                      <Smile className="h-3 w-3" />
                    </Badge>
                  </div>
                )}
                
                {showReactions === message.id && (
                  <div className="mt-2 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="flex flex-wrap gap-1">
                      {["👍", "❤️", "🎉", "🔥", "👀", "💯", "🙌", "👏"].map(emoji => (
                        <button
                          key={emoji}
                          className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-8 h-8 flex items-center justify-center rounded-md transition-colors"
                          onClick={() => {
                            handleLikeToggle(`${message.id}-${emoji}`);
                            toggleReactionPanel(null);
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full hover:bg-primary/10"
                    onClick={() => handleLikeToggle(`${message.id}-👍`)}
                  >
                    <Heart 
                      size={12} 
                      className={cn(
                        "transition-colors",
                        likedMessages.includes(`${message.id}-👍`) 
                          ? "text-red-500 fill-red-500" 
                          : "text-gray-500 hover:text-red-500"
                      )} 
                    />
                  </Button>
                  
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                    <MessageSquare size={12} className="text-gray-500 hover:text-primary transition-colors" />
                  </Button>
                  
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-primary/10">
                    <Share2 size={12} className="text-gray-500 hover:text-primary transition-colors" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Enhanced message input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900/80 sticky bottom-0">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${channelName}...`}
              className="pr-20 rounded-full border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
            
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <Smile size={15} className="text-gray-500" />
              </Button>
              
              <Popover open={showRichFeatures} onOpenChange={setShowRichFeatures}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Plus size={15} className="text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="end">
                  <div className="grid grid-cols-3 gap-1">
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <FileText size={14} />
                      <span className="text-xs">File</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <Link size={14} />
                      <span className="text-xs">Link</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <Poll size={14} />
                      <span className="text-xs">Poll</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <Calendar size={14} />
                      <span className="text-xs">Event</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <Gift size={14} />
                      <span className="text-xs">Gift</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex flex-col items-center h-16 w-full justify-center space-y-1">
                      <Sparkles size={14} />
                      <span className="text-xs">Kudos</span>
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 rounded-full"
            disabled={!message.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Custom Poll icon component
const Poll = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M3 7h18"></path>
    <path d="M3 12h18"></path>
    <path d="M3 17h9"></path>
    <path d="M16 16l1.5 1.5"></path>
    <path d="M19 14l-1.5 1.5"></path>
    <rect x="15" y="11" width="4" height="6" rx="1"></rect>
  </svg>
);

export default CommunityChannelContent;
