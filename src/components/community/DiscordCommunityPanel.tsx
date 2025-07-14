import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/community/CommunityService';
import { Message, ChatChannel } from '@/types/chat';
import ServerSidebar from './ServerSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Users, Hash, Search, Bell, Settings, Shield, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DiscordCommunityPanelProps {
  defaultChannel?: string;
}

const DiscordCommunityPanel: React.FC<DiscordCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Mock online users with more realistic data
  const mockOnlineUsers = [
    { name: 'Alex Chen', status: 'online', role: 'admin', avatar: '🦅' },
    { name: 'Maya Singh', status: 'online', role: 'moderator', avatar: '🌟' },
    { name: 'John Warrior', status: 'online', role: 'member', avatar: '⚔️' },
    { name: 'Sarah Growth', status: 'away', role: 'member', avatar: '🌱' },
    { name: 'Mike Builder', status: 'online', role: 'member', avatar: '🔨' },
    { name: 'Lisa Focus', status: 'busy', role: 'member', avatar: '🎯' },
  ];

  // Load channels on component mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const channelsData = await CommunityService.getChannels();
        setChannels(channelsData);
        
        // Simulate online users count
        setOnlineUsers(Math.floor(Math.random() * 50) + 15);
      } catch (error) {
        console.error('Error loading channels:', error);
        toast.error('Failed to load channels');
      }
    };

    loadChannels();
  }, []);

  // Load messages and set up subscription when channel changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeChat = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Join the channel
        await CommunityService.joinChannel(activeChannel, user.id);
        
        // Load existing messages
        const messagesData = await CommunityService.getMessages(activeChannel);
        setMessages(messagesData);
        
        // Set up realtime subscription
        unsubscribe = CommunityService.subscribeToMessages(
          activeChannel, 
          (newMessage) => {
            setMessages(prev => {
              // Check if message is already in the list
              const exists = prev.some(m => m.id === newMessage.id);
              if (exists) return prev;
              
              return [...prev, newMessage];
            });
          }
        );
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChat();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, activeChannel]);

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return false;
    }
    
    try {
      await CommunityService.sendMessage(content, activeChannel);
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return false;
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      // In a real implementation, this would call CommunityService.deleteMessage
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };
  
  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
    // Reset notifications for the selected channel
    if (notifications > 0) {
      setNotifications(Math.max(0, notifications - 1));
    }
  };

  const getChannelDisplayName = (channelName: string) => {
    return channelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-500" />;
      case 'moderator': return <Shield className="w-3 h-3 text-blue-500" />;
      default: return null;
    }
  };

  const channelCategories = [
    {
      name: 'Text Channels',
      channels: ['general', 'entrepreneurs', 'tech-talk', 'motivation', 'resources', 'announcements']
    },
    {
      name: 'Voice Channels',
      channels: ['morning-standup', 'study-hall', 'networking-lounge']
    }
  ];
  
  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Enhanced Channel Sidebar */}
      <div className={`${isMobile && !showChannelList ? 'hidden' : ''} ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-80' : 'w-80'} bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-lg`}>
        {/* Enhanced Server Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-lg">Warrior Community</h2>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10">
                  <Search className="w-4 h-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 relative">
                      <Bell className="w-4 h-4" />
                      {notifications > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500 text-white">
                          {notifications}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-3">
                    <h3 className="font-semibold mb-2">Notifications</h3>
                    <div className="space-y-2">
                      <div className="text-sm p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                        <span className="font-medium">@everyone</span> Weekly standup in 30 minutes
                      </div>
                      <div className="text-sm p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        New member <span className="font-medium">Sarah</span> joined the community
                      </div>
                      <div className="text-sm p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                        You were mentioned in <span className="font-medium">#tech-talk</span>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Connect • Learn • Grow Together</p>
            <div className="mt-2 flex items-center gap-4 text-xs text-blue-100">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                {onlineUsers} online
              </span>
              <span>{mockOnlineUsers.length} members</span>
            </div>
          </div>
        </div>

        {/* Enhanced Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search channels, members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Enhanced Channels List */}
        <div className="flex-1 overflow-y-auto p-3">
          {channelCategories.map((category) => (
            <div key={category.name} className="mb-6">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-3 flex items-center justify-between">
                {category.name}
                <Button variant="ghost" size="icon" className="h-4 w-4 opacity-60 hover:opacity-100">
                  <Settings className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {category.channels.map((channelName) => (
                  <button
                    key={channelName}
                    onClick={() => handleChannelSelect(channelName)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 group ${
                      activeChannel === channelName
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Hash size={16} className={`${activeChannel === channelName ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="text-sm font-medium">{channelName}</span>
                    {channelName === 'announcements' && (
                      <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5">
                        2
                      </Badge>
                    )}
                    {channelName === 'general' && activeChannel !== channelName && (
                      <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Enhanced Channel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChannelList(!showChannelList)}
                className="md:hidden"
              >
                <Hash size={16} />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Hash size={20} className="text-gray-500" />
              <h2 className="font-semibold text-gray-900 dark:text-white text-lg">
                {getChannelDisplayName(activeChannel)}
              </h2>
              {activeChannel === 'announcements' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                  📢 Important
                </Badge>
              )}
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <p className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 max-w-md truncate">
              {activeChannel === 'general' && "Welcome to the main community hub - Share ideas and connect"}
              {activeChannel === 'entrepreneurs' && "Entrepreneurial discussions and business insights"}
              {activeChannel === 'tech-talk' && "Technology discussions and development topics"}
              {activeChannel === 'motivation' && "Daily motivation and success stories"}
              {activeChannel === 'resources' && "Useful tools, links, and learning materials"}
              {activeChannel === 'announcements' && "Important community updates and news"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {onlineUsers} online
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMembersList(!showMembersList)}
              className="hidden lg:flex"
            >
              <Users size={16} />
            </Button>
          </div>
        </div>
        
        {/* Messages and Input Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {!user ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Join the Conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Please log in to participate in community discussions and connect with fellow warriors.
                  </p>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading}
                  onDeleteMessage={handleDeleteMessage}
                />
                
                <MessageInput 
                  onSendMessage={handleSendMessage} 
                  isLoading={isLoading} 
                  channelName={activeChannel}
                />
              </>
            )}
          </div>

          {/* Enhanced Members List Sidebar */}
          {showMembersList && (
            <div className="hidden lg:flex w-60 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Members — {mockOnlineUsers.length}
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {mockOnlineUsers.filter(u => u.status === 'online').length} online, {mockOnlineUsers.filter(u => u.status !== 'online').length} away
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                  {mockOnlineUsers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm">
                          {member.avatar}
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-800`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {member.name}
                          </span>
                          {getRoleIcon(member.role)}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {member.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && showChannelList && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setShowChannelList(false)}
        />
      )}
    </div>
  );
};

export default DiscordCommunityPanel;
