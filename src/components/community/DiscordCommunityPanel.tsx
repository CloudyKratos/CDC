
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
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Load channels on component mount
  useEffect(() => {
    const loadChannels = async () => {
      try {
        const channelsData = await CommunityService.getChannels();
        setChannels(channelsData);
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
      if (!user?.id) return;
      
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
  
  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
    if (isMobile) {
      setShowChannelList(false);
    }
  };
  
  return (
    <div className="flex h-full bg-white dark:bg-gray-900">
      {/* Channel Sidebar */}
      <ServerSidebar 
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        collapsed={isMobile && !showChannelList}
        channels={channels}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChannelHeader 
          channelName={activeChannel.replace(/-/g, ' ')}
          memberCount={1}
          onToggleMembersList={() => setShowChannelList(!showChannelList)}
          showMembersList={showChannelList && !isMobile}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-col flex-1 overflow-hidden">
            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
            />
            
            <MessageInput 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
              channelName={activeChannel}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordCommunityPanel;
