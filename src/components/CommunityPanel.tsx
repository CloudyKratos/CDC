
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Smile, 
  PlusCircle, 
  Image, 
  File, 
  AtSign, 
  Users, 
  Pin, 
  Mic, 
  Video, 
  Gift,
  Hash,
  BookOpen,
  Trophy,
  Bell,
  Globe,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import EmojiPicker from './EmojiPicker';
import CommunityChannelContent from './CommunityChannelContent';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  const [messages, setMessages] = useState<any[]>([]);
  
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    if (user) {
      fetchMessages();
      
      // Set up real-time subscription for new messages
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            console.log('New message:', payload);
            fetchMessages(); // Refresh messages when a new one is added
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, channelName]);
  
  const fetchMessages = async () => {
    try {
      const { data: workspaces, error: workspaceError } = await supabase
        .from('workspaces')
        .select('id')
        .eq('name', channelName)
        .single();
        
      if (workspaceError) {
        // If workspace doesn't exist, create it
        const { data: newWorkspace, error: createError } = await supabase
          .from('workspaces')
          .insert({ name: channelName, owner_id: user?.id })
          .select()
          .single();
          
        if (createError) throw createError;
        
        // Add current user as member
        await supabase
          .from('workspace_members')
          .insert({ workspace_id: newWorkspace.id, user_id: user?.id, role: 'owner' });
          
        return;
      }
      
      // Fetch messages for the workspace
      if (workspaces) {
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            id, content, created_at,
            sender_id, profiles:sender_id (username, avatar_url, full_name)
          `)
          .eq('workspace_id', workspaces.id)
          .order('created_at', { ascending: true });
          
        if (messagesError) throw messagesError;
        
        if (messagesData) {
          setMessages(messagesData);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        // Get workspace id
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .select('id')
          .eq('name', channelName)
          .single();
          
        if (workspaceError) {
          // Create workspace if it doesn't exist
          const { data: newWorkspace, error: createError } = await supabase
            .from('workspaces')
            .insert({ name: channelName, owner_id: user?.id })
            .select()
            .single();
            
          if (createError) throw createError;
          
          // Add message to the new workspace
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              content: message,
              sender_id: user?.id,
              workspace_id: newWorkspace.id
            });
            
          if (messageError) throw messageError;
          
          // Add current user as member
          await supabase
            .from('workspace_members')
            .insert({ workspace_id: newWorkspace.id, user_id: user?.id, role: 'owner' });
        } else {
          // Add message to existing workspace
          const { error: messageError } = await supabase
            .from('messages')
            .insert({
              content: message,
              sender_id: user?.id,
              workspace_id: workspace.id
            });
            
          if (messageError) throw messageError;
        }
        
        setMessage('');
        // Message will be added via real-time subscription
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
      case 'round-table':
        return <Mic className="mr-2" size={20} />;
      case 'daily-talks':
        return <MessageSquare className="mr-2" size={20} />;
      case 'global-connect':
        return <Globe className="mr-2" size={20} />;
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
            {channelName === 'round-table' && (
              <Badge variant="outline" className="ml-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800">
                Live
              </Badge>
            )}
            {channelName === 'global-connect' && (
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                Global
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {channelName === 'round-table' && (
              <>
                <Button variant="outline" size="sm" className="hidden md:flex items-center">
                  <Mic size={16} className="mr-1 text-primary" />
                  <span>Join Voice</span>
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex items-center">
                  <Video size={16} className="mr-1 text-green-500" />
                  <span>Start Video</span>
                </Button>
              </>
            )}
            
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
          <div className="space-y-4">
            {/* Welcome Message */}
            <div className="text-center my-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                {getChannelIcon()}
              </div>
              <h3 className="text-lg font-medium">Welcome to #{channelName}</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {channelName === 'general' && "This is the start of the general channel. All community discussions start here."}
                {channelName === 'introduction' && "Introduce yourself to the community! Tell us who you are and what brings you here."}
                {channelName === 'hall-of-fame' && "Celebrate achievements and recognize community members for their contributions."}
                {channelName === 'round-table' && "Join voice and video discussions on the latest topics in the community."}
                {channelName === 'daily-talks' && "Chat about your day, share thoughts, and engage in casual conversations."}
                {channelName === 'global-connect' && "Connect with members from around the world and discuss global trends and opportunities."}
              </p>
            </div>
            
            {/* Messages */}
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start group">
                <Avatar className="h-9 w-9 mr-3 mt-0.5">
                  <AvatarImage src={msg.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.profiles?.username || 'User'}`} />
                  <AvatarFallback>
                    {(msg.profiles?.username?.[0] || 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="font-medium">{msg.profiles?.full_name || msg.profiles?.username || 'Unknown User'}</span>
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
            ))}
            
            <div ref={messagesEndRef} />
          </div>
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
              disabled={!message.trim()}
              className={`rounded-full ${!message.trim() ? 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400' : 'bg-primary text-white'}`}
            >
              <Send size={18} />
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
