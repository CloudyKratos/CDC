
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CommunityService from '@/services/CommunityService';
import { Message } from '@/types/chat';
import ServerList from './ServerList';
import ServerSidebar from './ServerSidebar';
import ChannelHeader from './ChannelHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import MembersList from './MembersList';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCommunityChat } from '@/hooks/use-community-chat';

interface DiscordCommunityPanelProps {
  defaultChannel?: string;
}

const DiscordCommunityPanel: React.FC<DiscordCommunityPanelProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeServer, setActiveServer] = useState('main');
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [showMembersList, setShowMembersList] = useState(true);
  const isMobile = useIsMobile();
  
  const { user } = useAuth();
  const { messages, isLoading, sendMessage } = useCommunityChat(activeChannel);
  
  const members = [
    { id: '1', name: 'Alex Johnson', avatar: 'Alex', status: 'online' as const, role: 'Admin' as const },
    { id: '2', name: 'Sarah Miller', avatar: 'Sarah', status: 'online' as const, role: 'Moderator' as const },
    { id: '3', name: 'James Wilson', avatar: 'James', status: 'online' as const },
    { id: '4', name: 'Emily Davis', avatar: 'Emily', status: 'idle' as const },
    { id: '5', name: 'Michael Brown', avatar: 'Michael', status: 'dnd' as const },
    { id: '6', name: 'Olivia Taylor', avatar: 'Olivia', status: 'offline' as const },
    { id: '7', name: 'William Clark', avatar: 'William', status: 'offline' as const },
    { id: '8', name: 'Sophia Lee', avatar: 'Sophia', status: 'online' as const, game: 'Visual Studio Code' }
  ];
  
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !user?.id) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      throw error;
    }
  };
  
  const handleChannelSelect = (channelId: string) => {
    setActiveChannel(channelId);
  };
  
  const handleServerSelect = (serverId: string) => {
    setActiveServer(serverId);
    // Reset to default channel when changing servers
    setActiveChannel('general');
  };
  
  const toggleMembersList = () => {
    setShowMembersList(prev => !prev);
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
        activeChannel={activeChannel}
        onChannelSelect={handleChannelSelect}
        collapsed={isMobile}
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChannelHeader 
          channelName={activeChannel.replace(/-/g, ' ')}
          memberCount={members.filter(m => m.status !== 'offline').length}
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
          
          {/* Members List - Hide on mobile */}
          <MembersList 
            members={members} 
            collapsed={isMobile || !showMembersList} 
          />
        </div>
      </div>
    </div>
  );
};

export default DiscordCommunityPanel;
