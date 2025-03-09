
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
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmojiPicker } from './EmojiPicker';
import { CommunityChannelContent } from './CommunityChannelContent';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  
  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      // In a real app, you would send this message to your backend
      console.log('Sending message:', message);
      setMessage('');
      // Scroll to bottom after sending
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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
      default:
        return <Hash className="mr-2" size={20} />;
    }
  };
  
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
          <CommunityChannelContent channelName={channelName} />
          <div ref={messagesEndRef} />
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
                  <EmojiPicker onEmojiSelect={handleEmojiSelect} />
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
