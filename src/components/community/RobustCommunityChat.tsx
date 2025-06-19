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

  // Robust channel initialization
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🔄 Initializing robust chat for:', activeChannel);

      // Try to get or create channel with fallback
      let currentChannelId = null;
      
      try {
        // First attempt: try to get existing channel
        const { data: existingChannel, error: channelError } = await supabase
          .from('channels')
          .select('id')
          .eq('name', activeChannel)
          .eq('type', 'public')
          .maybeSingle();

        if (!channelError && existingChannel) {
          currentChannelId = existingChannel.id;
          console.log('✅ Found existing channel:', currentChannelId);
        } else if (!channelError) {
          // Channel doesn't exist, create it
          console.log('📝 Creating new channel:', activeChannel);
          const { data: newChannel, error: createError } = await supabase
            .from('channels')
            .insert({
              name: activeChannel,
              type: 'public',
              description: `${activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1)} channel`,
              created_by: user.id
            })
            .select('id')
            .single();

          if (!createError && newChannel) {
            currentChannelId = newChannel.id;
            console.log('✅ Created new channel:', currentChannelId);
          }
        }
      } catch (dbError) {
        console.warn('⚠️ Database channel operations failed, using fallback mode');
        // Use channel name as ID for fallback mode
        currentChannelId = activeChannel;
      }

      if (!currentChannelId) {
        throw new Error('Unable to initialize channel');
      }

      setChannelId(currentChannelId);

      // Try to load existing messages
      try {
        const { data: existingMessages, error: messagesError } = await supabase
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

        if (!messagesError && existingMessages) {
          const formattedMessages = existingMessages.map(msg => ({
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
          console.log('📝 No existing messages or unable to load');
          setMessages([]);
        }
      } catch (msgError) {
        console.warn('⚠️ Could not load messages:', msgError);
        setMessages([]);
      }

      // Set up real-time subscription
      setupRealtimeSubscription(currentChannelId);
      
      setIsConnected(true);
      setIsLoading(false);
      console.log('✅ Robust chat initialized successfully');

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
      setIsLoading(false);
      setIsConnected(false);
    }
  }, [user?.id, activeChannel]);

  // Real-time subscription setup
  const setupRealtimeSubscription = useCallback((channelId: string) => {
    console.log('📡 Setting up real-time subscription for:', channelId);
    
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
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;
          
          // Get sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

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
  }, []);

  // Send message function
  const handleSendMessage = useCallback(async (content: string) => {
    if (!user?.id || !channelId) {
      return;
    }

    try {
      console.log('📤 Sending message to channel:', channelId);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }, [user?.id, channelId]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    setError(null);
    initializeChat();
  }, [initializeChat]);

  // Initialize chat on mount and channel change
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Show error state
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
                {error}
              </p>
              <div className="space-y-3">
                <Button 
                  onClick={handleRetry} 
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Connection
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
                  Retry attempts: {retryCount}
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
