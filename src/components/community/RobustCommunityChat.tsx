
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChannelSidebar from './ChannelSidebar';
import ChatHeader from './ChatHeader';

interface RobustCommunityChatProps {
  defaultChannel?: string;
}

const RobustCommunityChat: React.FC<RobustCommunityChatProps> = ({
  defaultChannel = 'general'
}) => {
  const [activeChannel, setActiveChannel] = useState(defaultChannel);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showChannelList, setShowChannelList] = useState(true);
  
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // Default channels for fallback
  const defaultChannels = [
    { id: 'general', name: 'general', description: '💬 General community discussions' },
    { id: 'announcements', name: 'announcements', description: '📢 Important announcements' },
    { id: 'entrepreneurs', name: 'entrepreneurs', description: '🚀 Entrepreneurial discussions' },
    { id: 'tech-talk', name: 'tech-talk', description: '💻 Technology discussions' },
    { id: 'motivation', name: 'motivation', description: '💪 Daily motivation' },
    { id: 'resources', name: 'resources', description: '📚 Useful resources' }
  ];

  // Robust channel initialization with better error handling
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Initializing robust chat for:', activeChannel);

      let currentChannelId = null;
      
      try {
        // First attempt: try to get existing channel with a timeout
        const channelPromise = supabase
          .from('channels')
          .select('id')
          .eq('name', activeChannel)
          .eq('type', 'public')
          .maybeSingle();

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Channel query timeout')), 10000)
        );

        const { data: existingChannel, error: channelError } = await Promise.race([
          channelPromise,
          timeoutPromise
        ]) as any;

        if (!channelError && existingChannel) {
          currentChannelId = existingChannel.id;
          console.log('✅ Found existing channel:', currentChannelId);
        } else if (!channelError) {
          // Channel doesn't exist, try to create it
          console.log('📝 Creating new channel:', activeChannel);
          
          const createPromise = supabase
            .from('channels')
            .insert({
              name: activeChannel,
              type: 'public',
              description: `${activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1)} channel`,
              created_by: user.id
            })
            .select('id')
            .single();

          const { data: newChannel, error: createError } = await Promise.race([
            createPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Create timeout')), 10000))
          ]) as any;

          if (!createError && newChannel) {
            currentChannelId = newChannel.id;
            console.log('✅ Created new channel:', currentChannelId);
          } else {
            console.warn('⚠️ Could not create channel, using fallback mode');
            // Use channel name as ID for fallback mode
            currentChannelId = activeChannel;
          }
        } else {
          console.warn('⚠️ Channel query failed, using fallback mode:', channelError);
          currentChannelId = activeChannel;
        }
      } catch (dbError) {
        console.warn('⚠️ Database operations failed, using fallback mode:', dbError);
        currentChannelId = activeChannel;
      }

      if (!currentChannelId) {
        currentChannelId = activeChannel; // Final fallback
      }

      setChannelId(currentChannelId);

      // Try to load existing messages with timeout and error handling
      try {
        const messagesPromise = supabase
          .from('community_messages')
          .select(`
            id,
            content,
            created_at,
            sender_id,
            profiles!community_messages_sender_id_fkey (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('channel_id', currentChannelId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true });

        const { data: existingMessages, error: messagesError } = await Promise.race([
          messagesPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Messages timeout')), 8000))
        ]) as any;

        if (!messagesError && existingMessages) {
          const formattedMessages = existingMessages.map((msg: any) => ({
            id: msg.id,
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
            sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
              id: msg.sender_id,
              username: 'User',
              full_name: 'Community Member',
              avatar_url: null
            }
          }));
          setMessages(formattedMessages);
          console.log('✅ Loaded', formattedMessages.length, 'messages');
        } else {
          console.log('📝 No messages loaded or error occurred:', messagesError);
          setMessages([]);
        }
      } catch (msgError) {
        console.warn('⚠️ Could not load messages:', msgError);
        setMessages([]);
      }

      // Set up real-time subscription with error handling
      if (currentChannelId && currentChannelId !== activeChannel) {
        setupRealtimeSubscription(currentChannelId);
      }
      
      setIsConnected(true);
      setIsLoading(false);
      console.log('✅ Robust chat initialized successfully');

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      setIsLoading(false);
      setIsConnected(false);
      
      // Use fallback mode
      setChannelId(activeChannel);
      setMessages([]);
    }
  }, [user?.id, activeChannel]);

  // Enhanced real-time subscription setup with error handling
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    console.log('📡 Setting up real-time subscription for:', channelId);
    
    try {
      const subscription = supabase
        .channel(`robust_chat_${channelId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'community_messages',
            filter: `channel_id=eq.${channelId}`
          },
          async (payload) => {
            try {
              console.log('📨 New message received:', payload);
              const newMessage = payload.new as any;
              
              // Get sender profile with timeout
              const { data: sender } = await Promise.race([
                supabase
                  .from('profiles')
                  .select('id, username, full_name, avatar_url')
                  .eq('id', newMessage.sender_id)
                  .single(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Profile timeout')), 5000))
              ]) as any;

              const message: Message = {
                id: newMessage.id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.sender_id,
                sender: sender || {
                  id: newMessage.sender_id,
                  username: 'User',
                  full_name: 'Community Member',
                  avatar_url: null
                }
              };

              setMessages(prev => {
                const exists = prev.some(msg => msg.id === message.id);
                if (exists) return prev;
                return [...prev, message];
              });
            } catch (error) {
              console.warn('⚠️ Error processing real-time message:', error);
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });

      return () => {
        console.log('🧹 Cleaning up subscription');
        supabase.removeChannel(subscription);
      };
    } catch (error) {
      console.warn('⚠️ Error setting up real-time subscription:', error);
      setIsConnected(false);
    }
  }, []);

  // Enhanced send message function with better error handling
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId) {
      toast.error("Unable to send message - not connected");
      return;
    }

    try {
      console.log('📤 Sending message to channel:', channelId);
      
      // Add timeout to prevent hanging
      const sendPromise = supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content
        });

      const { error } = await Promise.race([
        sendPromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Send timeout')), 10000))
      ]) as any;

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message - please try again');
      throw error;
    }
  }, [user?.id, channelId]);

  // Handle retry with exponential backoff
  const handleRetry = useCallback(() => {
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    setError(null);
    
    // Exponential backoff for retries
    const delay = Math.min(1000 * Math.pow(2, newRetryCount - 1), 10000);
    
    setTimeout(() => {
      initializeChat();
    }, delay);
  }, [initializeChat, retryCount]);

  // Initialize chat on mount and channel change
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Reset retry count when user changes
  useEffect(() => {
    setRetryCount(0);
  }, [user?.id]);

  // Show error state with better messaging
  if (error && user?.id) {
    return (
      <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex-1 flex items-center justify-center p-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Chat Connection Issue
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error.includes('timeout') ? 
                  'Connection timeout - the chat service may be slow. Please try again.' :
                  error.includes('recursion') ?
                  'Database configuration issue detected. Please try again in a moment.' :
                  'Unable to connect to chat. Please check your connection and try again.'
                }
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry} 
                  className="w-full flex items-center gap-2"
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Connecting...' : 'Retry Connection'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Refresh Page
                </Button>
              </div>
              {retryCount > 0 && (
                <p className="text-sm text-gray-500 mt-4">
                  Retry attempts: {retryCount}/5
                  {retryCount >= 3 && (
                    <span className="block mt-1 text-xs">
                      Multiple attempts failed. Consider refreshing the page.
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950">
      {/* Channel Sidebar */}
      <ChannelSidebar
        channels={defaultChannels}
        activeChannel={activeChannel}
        onChannelSelect={setActiveChannel}
        isMobile={isMobile}
        showChannelList={showChannelList}
        onToggleChannelList={setShowChannelList}
      />

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Chat Header */}
        <ChatHeader
          activeChannel={activeChannel}
          isConnected={isConnected}
          isMobile={isMobile}
          showChannelList={showChannelList}
          onToggleChannelList={setShowChannelList}
        />

        {/* Connection Status */}
        {!isConnected && user && !error && (
          <div className="bg-amber-100 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2">
            <div className="flex items-center justify-center text-sm text-amber-800 dark:text-amber-200">
              <div className="animate-pulse mr-2">🔄</div>
              Connecting to real-time chat...
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            activeChannel={activeChannel}
          />
        </div>

        {/* Message Input */}
        {user && (
          <MessageInput
            onSendMessage={handleSendMessage}
            activeChannel={activeChannel}
            isConnected={isConnected}
            isLoading={isLoading}
          />
        )}

        {/* Unauthenticated View */}
        {!user && (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Join the Community
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Sign in to participate in community discussions and connect with other members.
                </p>
                <Button className="w-full">
                  Sign In to Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default RobustCommunityChat;
