import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedRealtimeChat } from './hooks/useEnhancedRealtimeChat';
import { useSimpleChat } from './hooks/useSimpleChat';
import { useIsMobile } from '@/hooks/use-mobile';
import MessageInput from '../messaging/MessageInput';
import { SimpleMessagesList } from '../messaging/SimpleMessagesList';
import { SimpleChatHeader } from '../messaging/SimpleChatHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Users, Wifi, WifiOff } from 'lucide-react';

const CHANNELS = [
  { id: 'announcement', name: 'Announcement', icon: '📢' },
  { id: 'general', name: 'General', icon: '💬' },
  { id: 'morning-journey', name: 'Morning Journey', icon: '🌅' },
  { id: 'random', name: 'Random', icon: '🎲' },
  { id: 'tech-talk', name: 'Tech Talk', icon: '⚡' },
  { id: 'wellness', name: 'Wellness', icon: '🧘' }
];

interface EnhancedChatInterfaceProps {
  defaultChannel?: string;
  useEnhancedMode?: boolean;
}

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({ 
  defaultChannel = 'general',
  useEnhancedMode = false
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  // Use enhanced mode for desktop, simple mode for mobile or when specified
  const shouldUseEnhanced = useEnhancedMode && !isMobile;
  
  const enhancedChatState = useEnhancedRealtimeChat(activeChannel);
  const simpleChatState = useSimpleChat(activeChannel);
  
  // Use appropriate chat state based on mode
  const chatState = shouldUseEnhanced ? enhancedChatState : simpleChatState;
  
  const { 
    messages = [], 
    isLoading = false, 
    error = null, 
    isConnected = false, 
    sendMessage = async () => false
  } = chatState || {};

  // Enhanced features (only available in enhanced mode)
  const enhancedFeatures = shouldUseEnhanced && enhancedChatState ? {
    onlineUsers: (enhancedChatState as any).onlineUsers || [],
    typing: (enhancedChatState as any).typing || [],
    startTyping: (enhancedChatState as any).startTyping || (() => {}),
    stopTyping: (enhancedChatState as any).stopTyping || (() => {})
  } : {
    onlineUsers: [],
    typing: [],
    startTyping: () => {},
    stopTyping: () => {}
  };

  const currentChannel = CHANNELS.find(c => c.id === activeChannel);
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced send message handler with typing indicators
  const handleSendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!content.trim()) return false;
    
    if (!user?.id) {
      toast.error("Please sign in to send messages");
      return false;
    }

    // Stop typing indicator when sending
    enhancedFeatures.stopTyping();

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
  }, [user?.id, sendMessage, enhancedFeatures]);

  // Handle typing indicators for enhanced mode
  const handleTyping = useCallback(() => {
    if (shouldUseEnhanced) {
      enhancedFeatures.startTyping();
    }
  }, [shouldUseEnhanced, enhancedFeatures]);

  const handleStopTyping = useCallback(() => {
    if (shouldUseEnhanced) {
      enhancedFeatures.stopTyping();
    }
  }, [shouldUseEnhanced, enhancedFeatures]);

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
      {/* Enhanced Header with additional features */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SimpleChatHeader 
          channels={CHANNELS}
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          isConnected={isConnected}
        />
        
        {/* Enhanced status bar for desktop */}
        {shouldUseEnhanced && (
          <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-t">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {isConnected ? (
                  <Wifi className="h-3 w-3 text-green-500" />
                ) : (
                  <WifiOff className="h-3 w-3 text-red-500" />
                )}
                <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              {enhancedFeatures.onlineUsers.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{enhancedFeatures.onlineUsers.length} online</span>
                </div>
              )}
            </div>
            
            {/* Typing indicators */}
            {enhancedFeatures.typing.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs">
                  {enhancedFeatures.typing.length === 1 ? 'Someone is' : `${enhancedFeatures.typing.length} people are`} typing...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <SimpleMessagesList 
          messages={messages}
          isLoading={isLoading}
          error={error}
          currentUserId={user.id}
        />
      </div>

      {/* Enhanced Input Area */}
      <div className="border-t bg-background">
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          recipientName={currentChannel?.name || activeChannel}
          placeholder={`Message ${currentChannel?.name || activeChannel}...`}
        />
      </div>

      {/* Connection Status Overlay */}
      {!isConnected && (
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-800 px-4 py-2",
          "transition-all duration-300"
        )}>
          <div className="flex items-center justify-center text-sm text-yellow-700 dark:text-yellow-300">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-2"></div>
            {error || 'Connecting to chat...'}
          </div>
        </div>
      )}

      {/* Enhanced Mode Indicator */}
      {shouldUseEnhanced && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
          Enhanced Mode
        </div>
      )}
    </div>
  );
};