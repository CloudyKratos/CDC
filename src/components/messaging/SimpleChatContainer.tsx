import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimpleChat } from '../community/hooks/useSimpleChat';
import MessageInput from './MessageInput';
import { SimpleMessagesList } from './SimpleMessagesList';
import { SimpleChatHeader } from './SimpleChatHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CHANNELS = [
  { id: 'announcement', name: 'Announcement', icon: '📢' },
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'morning-journey', name: 'Morning Journey', icon: '🌅' },
  { id: 'random', name: 'Random', icon: '🎲' }
];

export const SimpleChatContainer: React.FC = () => {
  const [activeChannel, setActiveChannel] = useState('general');
  const { user } = useAuth();
  
  const chatState = useSimpleChat(activeChannel);
  const { 
    messages = [], 
    isLoading = false, 
    error = null, 
    isConnected = false, 
    sendMessage = async () => false 
  } = chatState || {};

  const currentChannel = CHANNELS.find(c => c.id === activeChannel);

  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) return false;
    
    if (!user?.id) {
      toast.error("Please sign in to send messages");
      return false;
    }

    try {
      const success = await sendMessage(content);
      if (!success) {
        toast.error('Failed to send message');
      } else {
        console.log('✅ Message sent successfully');
      }
      return success;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
      return false;
    }
  }, [user?.id, sendMessage]);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Join the Chat</h3>
          <p className="text-muted-foreground">Sign in to start chatting with the community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Simple Header with Channel Tabs */}
      <SimpleChatHeader 
        channels={CHANNELS}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <SimpleMessagesList 
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserId={user.id}
        />
      </div>

      <div className="border-t bg-background">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          recipientName={currentChannel?.name || activeChannel}
          placeholder={`Message ${currentChannel?.name || activeChannel}...`}
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-800 px-4 py-2">
          <div className="flex items-center justify-center text-sm text-yellow-700 dark:text-yellow-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            Connecting...
          </div>
        </div>
      )}
    </div>
  );
};