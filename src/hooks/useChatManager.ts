
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { toast } from 'sonner';
import { useChannelManager } from './use-channel-manager';
import { useEnhancedRealtime } from './use-enhanced-realtime';
import { useMessageActions } from './use-message-actions';

export function useChatManager(channelName: string = 'general') {
  const [isSending, setIsSending] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  
  const channelManager = useChannelManager();
  const realtime = useEnhancedRealtime();
  const messageActions = useMessageActions();

  // Initialize chat for the given channel
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName || isInitialized) {
      return;
    }

    try {
      console.log('🚀 Initializing chat for:', channelName);
      setIsInitialized(true);
      
      // Clear previous messages when switching channels
      realtime.clearMessages();
      
      // Get or create channel
      const channelId = await channelManager.setActiveChannel(channelName);
      if (!channelId) {
        console.error('❌ Failed to get channel ID');
        setIsInitialized(false);
        return;
      }

      // Load message history
      console.log('📥 Loading messages for channel:', channelId);
      await realtime.loadMessages(channelId);
      
      // Subscribe to realtime updates
      console.log('📡 Setting up realtime subscription');
      realtime.subscribeToChannel(channelId);
      
      console.log('✅ Chat initialized successfully for:', channelName);
      
    } catch (error) {
      console.error('💥 Failed to initialize chat:', error);
      toast.error('Failed to connect to chat');
      setIsInitialized(false);
    }
  }, [user?.id, channelName, isInitialized, channelManager, realtime]);

  // Send message with enhanced error handling
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelManager.activeChannelId || isSending || !content.trim()) return false;

    setIsSending(true);
    try {
      console.log('📤 Sending message');
      
      const success = await realtime.sendMessage(channelManager.activeChannelId, content);
      if (!success) {
        toast.error('Failed to send message');
        return false;
      }
      return true;
    } catch (error) {
      console.error('💥 Send message error:', error);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [channelManager.activeChannelId, isSending, realtime]);

  // Delete message wrapper
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;
    
    try {
      await messageActions.deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }, [user?.id, messageActions]);

  // Initialize on mount and channel change
  useEffect(() => {
    if (user?.id && channelName && !isInitialized) {
      initializeChat();
    }
  }, [user?.id, channelName, isInitialized, initializeChat]);

  // Load available channels on mount
  useEffect(() => {
    if (user?.id) {
      channelManager.loadChannels();
    }
  }, [user?.id, channelManager]);

  // Reset initialization when channel changes
  useEffect(() => {
    setIsInitialized(false);
  }, [channelName]);

  return {
    // Messages and loading state
    messages: realtime.messages,
    isLoading: realtime.isLoading || channelManager.isLoading,
    
    // Connection state
    isConnected: realtime.isConnected,
    
    // Channel info
    channelId: channelManager.activeChannelId,
    channels: channelManager.channels,
    
    // Message actions
    sendMessage,
    deleteMessage,
    replyToMessage: messageActions.replyToMessage,
    addReaction: messageActions.addReaction,
    
    // State flags
    isSending,
    
    // Error handling
    error: channelManager.error || realtime.connectionError,
    reconnect: () => {
      console.log('🔄 Manual reconnect triggered');
      setIsInitialized(false);
      realtime.reconnect();
    }
  };
}
