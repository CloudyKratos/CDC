
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/CommunityService';
import { Message, ChatChannel } from '@/types/chat';
import ServerList from './ServerList';
import ServerSidebar from './ServerSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MembersList from './MembersList';
import StageRoomPanel from '../stage/StageRoomPanel';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface DiscordCommunityPanelProps {
  defaultChannel?: string;
}

const DiscordCommunityPanel: React.FC<DiscordCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeServer, setActiveServer] = useState('main');
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showMembersList, setShowMembersList] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'stage'>('chat');
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
      if (!user?.id || viewMode !== 'chat') return;
      
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
  }, [user?.id, activeChannel, viewMode]);

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
    if (channelId === 'stage-rooms') {
      setViewMode('stage');
    } else {
      setViewMode('chat');
      setActiveChannel(channelId);
    }
  };
  
  const handleServerSelect = (serverId: string) => {
    setActiveServer(serverId);
    setViewMode('chat');
    setActiveChannel('general');
  };
  
  const toggleMembersList = () => {
    setShowMembersList(prev => !prev);
  };

  // Sample members for now - in production this would come from the database
  const members = [
    { id: '1', name: user?.name || 'You', avatar: user?.name || 'You', status: 'online' as const, role: 'Member' as const },
  ];
  
  const renderMainContent = () => {
    if (viewMode === 'stage') {
      return <StageRoomPanel />;
    }

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChannelHeader 
          channelName={activeChannel.replace(/-/g, ' ')}
          memberCount={members.length}
          onToggleMembersList={toggleMembersList}
          showMembersList={showMembersList}
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
          
          {/* Members List - Hide on mobile or when in stage mode */}
          <MembersList 
            members={members} 
            collapsed={isMobile || !showMembersList} 
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="flex h-full">
      {/* Server List */}
      <ServerList 
        activeServer={activeServer} 
        onServerSelect={handleServerSelect} 
      />
      
      {/* Channel Sidebar */}
      <ServerSidebar 
        activeChannel={viewMode === 'stage' ? 'stage-rooms' : activeChannel}
        onChannelSelect={handleChannelSelect}
        collapsed={isMobile}
        channels={channels}
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
};

export default DiscordCommunityPanel;
