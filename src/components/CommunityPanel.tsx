import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  PlusCircle, 
  Image, 
  Hash,
  BookOpen,
  Trophy,
  Bell,
  Globe,
  MessageSquare,
  Pin,
  Users,
  Mic,
  Video,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import EmojiPicker from './EmojiPicker';
import CommunityChannelContent from './CommunityChannelContent';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import CommunityService, { Message } from '@/services/CommunityService';

interface CommunityPanelProps {
  channelName: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ channelName }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([
    { id: 1, name: 'Alex Johnson', status: 'online', role: 'Admin', avatar: 'Alex' },
    { id: 2, name: 'Sarah Miller', status: 'online', role: 'Moderator', avatar: 'Sarah' },
    { id: 3, name: 'James Wilson', status: 'online', role: 'Member', avatar: 'James' },
    { id: 4, name: 'Emily Davis', status: 'idle', role: 'Member', avatar: 'Emily' },
    { id: 5, name: 'Michael Brown', status: 'dnd', role: 'Member', avatar: 'Michael' },
    { id: 6, name: 'Olivia Taylor', status: 'offline', role: 'Member', avatar: 'Olivia' },
    { id: 7, name: 'William Clark', status: 'offline', role: 'Member', avatar: 'William' },
    { id: 8, name: 'Sophia Lee', status: 'online', role: 'Member', avatar: 'Sophia' },
  ]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initializeChat = async () => {
      if (user?.id) {
        setIsLoading(true);
        
        try {
          // Join the channel
          await CommunityService.joinChannel(channelName, user.id);
          
          // Load existing messages
          const messagesData = await CommunityService.getMessages(channelName, user.id);
          setMessages(messagesData);
          
          // Set up realtime subscription for new messages
          unsubscribe = await CommunityService.subscribeToMessages(
            channelName, 
            user.id,
            (newMessage) => {
              setMessages(prev => {
                // Check if message is already in the list
                const exists = prev.some(m => m.id === newMessage.id);
                if (exists) return prev;
                
                return [...prev, newMessage];
              });
            }
          );
          
          // Get channel members
          loadChannelMembers();
        } catch (error) {
          console.error('Error initializing chat:', error);
          toast.error('Failed to load chat');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    initializeChat();
    
    // Cleanup subscription when component unmounts or channel changes
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.id, channelName]);
  
  const loadChannelMembers = async () => {
    try {
      const members = await CommunityService.getChannelOnlineUsers(channelName);
      // We would update the online users state here, but for now we'll keep the demo data
    } catch (error) {
      console.error('Error loading channel members:', error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('You must be logged in to send messages');
      return;
    }
    
    if (message.trim()) {
      try {
        // Send the message
        await CommunityService.sendMessage(channelName, message, user.id);
        
        // Clear message input (real-time subscription will add the message)
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      }
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const getChannelIcon = () => {
    switch(channelName) {
      case 'general':
        return <Hash className="mr-2" size={20} />;
      case 'introduction':
        return <BookOpen className="mr-2" size={20} />;
      case 'hall-of-fame':
        return <Trophy className="mr-2" size={20} />;
      case 'global-connect':
        return <Globe className="mr-2" size={20} />;
      case 'daily-talks':
        return <MessageSquare className="mr-2" size={20} />;
      default:
        return <Hash className="mr-2" size={20} />;
    }
  };
  
  // List of emojis for the emoji picker
  const emojis = ['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆', '🎊', '🙏', '👌', '💬'];
  
  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
          <div className="flex items-center">
            {getChannelIcon()}
            <h2 className="text-lg font-semibold">
              {channelName.replace(/-/g, ' ')}
            </h2>
            {channelName === 'global-connect' && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                Global
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Pin size={18} />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Bell size={18} />
            </Button>
            
            <Button variant="ghost" size="icon">
              <Users size={18} />
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Welcome Message */}
              <div className="text-center my-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  {getChannelIcon()}
                </div>
                <h3 className="text-lg font-medium">Welcome to #{channelName}</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  {channelName === 'general' && "This is the start of the general channel. All community discussions start here."}
                  {channelName === 'hall-of-fame' && "Celebrate achievements and recognize community members for their contributions."}
                  {channelName === 'daily-talks' && "Chat about your day, share thoughts, and engage in casual conversations."}
                  {channelName === 'global-connect' && "Connect with members from around the world and discuss global trends and opportunities."}
                </p>
              </div>
              
              {/* Messages */}
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start group">
                    <Avatar className="h-9 w-9 mr-3 mt-0.5">
                      <AvatarImage src={msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.username || 'User'}`} />
                      <AvatarFallback>
                        {(msg.sender?.username?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className="font-medium">{msg.sender?.full_name || msg.sender?.username || 'Unknown User'}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="opacity-0 group-hover:opacity-100 ml-2 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Smile size={14} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MessageSquare size={14} />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-1 text-sm">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
          <CommunityChannelContent channelName={channelName} />
        </ScrollArea>
        
        {/* Message Input Area */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={handleFileUpload}
            >
              <PlusCircle size={20} />
            </Button>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={(e) => console.log('Files selected:', e.target.files)}
            />
            
            <div className="relative flex-1">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Message #${channelName}`}
                className="bg-gray-100 dark:bg-gray-800 border-0 focus-visible:ring-1 focus-visible:ring-primary pl-3 pr-10 py-5"
                disabled={isLoading || !user?.id}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
              </Button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2">
                  <EmojiPicker 
                    emojis={emojis}
                    onSelectEmoji={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              size="icon"
              disabled={!message.trim() || isLoading || !user?.id}
              className={`rounded-full ${!message.trim() || isLoading || !user?.id ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-primary text-white'}`}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
            </Button>
          </form>
        </div>
      </div>
      
      {/* Online Members Sidebar - Hidden on Mobile */}
      {!isMobile && (
        <div className="w-56 border-l border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-sm hidden md:flex flex-col">
          <div className="p-3 border-b border-gray-200 dark:border-gray-800">
            <h3 className="font-medium text-sm">MEMBERS — {onlineUsers.length}</h3>
          </div>
          
          <ScrollArea className="flex-1 py-2">
            <div className="space-y-1 px-2">
              {/* Online Members */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                  ONLINE — {onlineUsers.filter(u => u.status === 'online').length}
                </p>
                {onlineUsers
                  .filter(user => user.status === 'online')
                  .map(user => (
                    <div key={user.id} className="flex items-center px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                      {user.role !== 'Member' && (
                        <Badge variant="outline" className="text-[10px] h-4 bg-gray-100 dark:bg-gray-800">
                          {user.role}
                        </Badge>
                      )}
                    </div>
                  ))
                }
              </div>
              
              {/* Idle Members */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                  IDLE — {onlineUsers.filter(u => u.status === 'idle').length}
                </p>
                {onlineUsers
                  .filter(user => user.status === 'idle')
                  .map(user => (
                    <div key={user.id} className="flex items-center px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-yellow-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
              
              {/* Do Not Disturb Members */}
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                  DO NOT DISTURB — {onlineUsers.filter(u => u.status === 'dnd').length}
                </p>
                {onlineUsers
                  .filter(user => user.status === 'dnd')
                  .map(user => (
                    <div key={user.id} className="flex items-center px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
              
              {/* Offline Members */}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 mb-1">
                  OFFLINE — {onlineUsers.filter(u => u.status === 'offline').length}
                </p>
                {onlineUsers
                  .filter(user => user.status === 'offline')
                  .map(user => (
                    <div key={user.id} className="flex items-center px-2 py-1 rounded hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer opacity-60">
                      <div className="relative">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatar}`} />
                          <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800"></span>
                      </div>
                      <div className="ml-2 flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default CommunityPanel;
