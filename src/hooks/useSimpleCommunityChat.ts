
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface UseSimpleCommunityChat {
  messages: Message[];
  users: User[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  startTyping: () => void;
  reconnect: () => void;
  isReady: boolean;
}

export function useSimpleCommunityChat(channelName: string): UseSimpleCommunityChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  // Initialize chat
  const initializeChat = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ No user ID available');
      setIsLoading(false);
      setError('Please sign in to use chat');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Initializing simple chat for:', channelName, 'User:', user.id);

      // Ensure user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile check error:', profileError);
        throw new Error(`Profile error: ${profileError.message}`);
      }

      if (!profile) {
        console.log('📝 Creating user profile');
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.email?.split('@')[0] || 'Anonymous',
            email: user.email
          });

        if (insertError) {
          console.error('❌ Profile creation error:', insertError);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
      }

      // Get or create channel with proper created_by
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id, created_by')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError) {
        console.error('❌ Channel lookup error:', channelError);
        throw new Error(`Channel lookup failed: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} discussion`,
            created_by: user.id
          })
          .select('id, created_by')
          .single();

        if (createError) {
          console.error('❌ Channel creation error:', createError);
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        channel = newChannel;
      }

      // Fix channel if it has null created_by
      if (!channel.created_by) {
        console.log('🔧 Fixing channel created_by field');
        const { error: updateError } = await supabase
          .from('channels')
          .update({ created_by: user.id })
          .eq('id', channel.id);

        if (updateError) {
          console.warn('⚠️ Could not fix channel created_by:', updateError);
        }
      }

      setChannelId(channel.id);
      console.log('✅ Channel ready:', channel.id);

      // Ensure user is in channel
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'member'
        });

      // Ignore duplicate key errors
      if (memberError && !memberError.message.includes('duplicate key')) {
        console.warn('⚠️ Could not add user to channel:', memberError);
      }

      // Load existing messages
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
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        console.error('❌ Messages load error:', messagesError);
        throw new Error(`Failed to load messages: ${messagesError.message}`);
      }

      const formattedMessages = (existingMessages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      console.log(`✅ Loaded ${formattedMessages.length} messages`);

      // Setup real-time subscriptions
      setupRealtimeSubscriptions(channel.id);
      setupPresenceTracking(channelName);
      
      setIsConnected(true);
      setIsReady(true);
      setIsLoading(false);
      
      console.log('✅ Simple chat initialized successfully');

    } catch (err) {
      console.error('💥 Failed to initialize chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chat';
      setError(errorMessage);
      setIsConnected(false);
      setIsReady(false);
      setIsLoading(false);
    }
  }, [user?.id, channelName]);

  // Setup real-time subscriptions
  const setupRealtimeSubscriptions = useCallback((channelId: string) => {
    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
    }

    console.log('📡 Setting up real-time subscription for channel:', channelId);
    
    subscriptionRef.current = supabase
      .channel(`simple_chat_${channelId}`)
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
              username: 'Unknown User',
              full_name: 'Unknown User',
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
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(msg => msg.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });
  }, []);

  // Setup presence tracking
  const setupPresenceTracking = useCallback((channelName: string) => {
    if (!user?.id) return;

    if (presenceChannelRef.current) {
      supabase.removeChannel(presenceChannelRef.current);
    }

    presenceChannelRef.current = supabase
      .channel(`presence_${channelName}`)
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current?.presenceState();
        const onlineUsers = Object.values(state || {}).flat().map((presence: any) => ({
          id: presence.user_id,
          username: presence.username,
          full_name: presence.full_name,
          is_online: true
        }));
        setUsers(onlineUsers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences.map((presence: any) => ({
          id: presence.user_id,
          username: presence.username,
          full_name: presence.full_name,
          is_online: true
        }));
        setUsers(prev => [...prev.filter(u => !newUsers.find(nu => nu.id === u.id)), ...newUsers]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUserIds = leftPresences.map((p: any) => p.user_id);
        setUsers(prev => prev.filter(u => !leftUserIds.includes(u.id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannelRef.current?.track({
            user_id: user.id,
            username: user.email?.split('@')[0] || 'Anonymous',
            full_name: user.email || 'Anonymous User',
            online_at: new Date().toISOString()
          });
        }
      });
  }, [user]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) {
      console.error('❌ Cannot send message - missing requirements');
      toast.error("Cannot send message");
      return false;
    }

    try {
      console.log('📤 Sending message:', content);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Send message error:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
      return true;
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
      toast.success("Message deleted", { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Start typing (placeholder)
  const startTyping = useCallback(() => {
    // Simple typing indicator - no complex logic for now
  }, []);

  // Reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setError(null);
    initializeChat();
  }, [initializeChat]);

  // Initialize on mount
  useEffect(() => {
    initializeChat();
    
    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (presenceChannelRef.current) {
        supabase.removeChannel(presenceChannelRef.current);
      }
    };
  }, [initializeChat]);

  return {
    messages,
    users,
    isConnected,
    isLoading,
    error,
    sendMessage,
    deleteMessage,
    startTyping,
    reconnect,
    isReady
  };
}
