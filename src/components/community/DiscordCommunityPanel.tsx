
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/CommunityService';
import { Message, ChatChannel } from '@/types/chat';
import ServerSidebar from './ServerSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Users, Hash } from 'lucide-react';

interface DiscordCommunityPanelProps {
  defaultChannel?: string;
}

const DiscordCommunityPanel: React.FC<DiscordCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showChannelList, setShowChannelList] = useState(true);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(0);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Load channels on component mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const channelsData = await CommunityService.getChannels();
        setChannels(channelsData);
        
        // Simulate online users count
        setOnlineUsers(Math.floor(Math.random() * 50) + 10);
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

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      await CommunityService.sendMessage(content, activeChannel);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      throw error;
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
  };

  const getChannelDisplayName = (channelName: string) => {
    return channelName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div className="flex h-full bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-800/50">
      {/* Channel Sidebar */}
      <div className={`${isMobile && !showChannelList ? 'hidden' : ''} ${isMobile ? 'absolute inset-y-0 left-0 z-50 w-72' : 'w-72'} bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col`}>
        {/* Server Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600">
          <h2 className="text-white font-bold text-lg">Warrior Community</h2>
          <p className="text-blue-100 text-sm">Connect • Learn • Grow</p>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2">
              Text Channels
            </div>
            <div className="space-y-1">
              {['general', 'entrepreneurs', 'tech-talk', 'motivation', 'resources'].map((channelName) => (
                <button
                  key={channelName}
                  onClick={() => handleChannelSelect(channelName)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors ${
                    activeChannel === channelName
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Hash size={16} />
                  <span className="text-sm">{channelName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
              <Users size={12} />
              Online ({onlineUsers})
            </div>
            <div className="space-y-1 px-2">
              {/* Mock online users */}
              {['Alex Chen', 'Maya Singh', 'John Warrior', 'Sarah Growth'].map((name, index) => (
                <div key={name} className="flex items-center gap-2 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Channel Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
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
            <Hash size={20} className="text-gray-500" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">
                {getChannelDisplayName(activeChannel)}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Welcome to #{activeChannel} - Share ideas and connect with fellow warriors
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              {onlineUsers} online
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowChannelList(!showChannelList)}
              className="hidden md:flex"
            >
              <Users size={16} />
            </Button>
          </div>
        </div>
        
        {/* Messages Area */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            {!user ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Join the Conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    Please log in to participate in community discussions and connect with fellow warriors.
                  </p>
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
