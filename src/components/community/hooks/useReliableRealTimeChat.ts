import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface RealtimeChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  channelId: string | null;
}

// Simple message cache for persistence
const messageCache = new Map<string, Message[]>();

export function useReliableRealTimeChat(channelName: string): RealtimeChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  console.log('🎯 useReliableRealTimeChat for channel:', channelName);

  // Get or create channel
  const getOrCreateChannel = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting channel:', name);
      
      // Try to find existing channel
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .single();

      if (existingChannel) {
        console.log('✅ Found channel:', existingChannel.id);
        return existingChannel.id;
      }

      // Create new channel
      console.log('📝 Creating channel:', name);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: name,
          type: 'public',
          description: `${name} discussion`,
          created_by: user.id
        })
        .select('id')
        .single();

      if (createError) {
        if (createError.code === '23505') {
          // Handle race condition
          const { data: raceChannel } = await supabase
            .from('channels')
            .select('id')
            .eq('name', name)
            .eq('type', 'public')
            .single();
          return raceChannel?.id || null;
        }
        throw createError;
      }

      console.log('✅ Created channel:', newChannel.id);
      return newChannel.id;
    } catch (err) {
      console.error('❌ Channel error:', err);
      return null;
    }
  }, [user?.id]);

  // Load messages
  const loadMessages = useCallback(async (chId: string) => {
    try {
      console.log('📥 Loading messages for channel:', chId);
      
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select(`
          id, content, created_at, sender_id,
          is_deleted, edited, edited_at,
          profiles!community_messages_sender_id_fkey(
            id, username, full_name, avatar_url
          )
        `)
        .eq('channel_id', chId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        is_deleted: msg.is_deleted || false,
        edited: msg.edited || false,
        edited_at: msg.edited_at,
        reactions: [],
        sender: msg.profiles ? {
          id: msg.profiles.id,
          username: msg.profiles.username || 'User',
          full_name: msg.profiles.full_name || 'Community Member',
          avatar_url: msg.profiles.avatar_url
        } : {
          id: msg.sender_id,
          username: 'User',
          full_name: 'Community Member',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      messageCache.set(channelName, formattedMessages);
      console.log('✅ Loaded messages:', formattedMessages.length);
      
    } catch (err) {
      console.error('❌ Load messages error:', err);
      setError('Failed to load messages');
      
      // Try to use cached messages
      const cached = messageCache.get(channelName);
      if (cached) {
        setMessages(cached);
        console.log('📦 Using cached messages:', cached.length);
      }
    }
  }, [channelName]);

  // Setup realtime subscription
  const setupSubscription = useCallback((chId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up old subscription');
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    console.log('📡 Setting up subscription for channel:', chId);
    
    const subscription = supabase
      .channel(`messages-${chId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${chId}`
        },
        async (payload) => {
          console.log('📨 New message:', payload.new);
          const newMessage = payload.new as any;
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id,
            is_deleted: newMessage.is_deleted || false,
            edited: newMessage.edited || false,
            edited_at: newMessage.edited_at,
            reactions: [],
            sender: profile || {
              id: newMessage.sender_id,
              username: 'User',
              full_name: 'Community Member',
              avatar_url: null
            }
          };

          setMessages(prev => {
            const exists = prev.find(m => m.id === message.id);
            if (exists) return prev;
            
            const updated = [...prev, message];
            messageCache.set(channelName, updated);
            return updated;
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${chId}`
        },
        (payload) => {
          console.log('🔄 Message updated:', payload.new);
          const updatedMsg = payload.new as any;
          
          setMessages(prev => {
            const updated = prev.map(msg => {
              if (msg.id === updatedMsg.id) {
                if (updatedMsg.is_deleted) {
                  return null; // Will be filtered out
                }
                return {
                  ...msg,
                  content: updatedMsg.content,
                  edited: updatedMsg.edited || false,
                  edited_at: updatedMsg.edited_at
                };
              }
              return msg;
            }).filter(Boolean) as Message[];
            
            messageCache.set(channelName, updated);
            return updated;
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          setError(null);
          console.log('✅ Connected to realtime');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn('❌ Subscription failed:', status);
          setError('Connection failed, retrying...');
          
          // Retry after 2 seconds
          setTimeout(() => setupSubscription(chId), 2000);
        }
      });

    subscriptionRef.current = subscription;
  }, [channelName]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) return false;

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
        console.error('❌ Send error:', error);
        toast.error('Failed to send message');
        return false;
      }

      console.log('✅ Message sent');
      return true;
    } catch (err) {
      console.error('❌ Send error:', err);
      toast.error('Failed to send message');
      return false;
    }
  }, [user?.id, channelId]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id) return;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      // Optimistic update
      setMessages(prev => {
        const updated = prev.filter(m => m.id !== messageId);
        messageCache.set(channelName, updated);
        return updated;
      });

      const { error } = await supabase
        .from('community_messages')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Delete error:', error);
        // Restore on error
        const cached = messageCache.get(channelName);
        if (cached) setMessages(cached);
        toast.error('Failed to delete message');
        return;
      }

      console.log('✅ Message deleted');
      toast.success('Message deleted');
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error('Failed to delete message');
    }
  }, [user?.id, channelName]);

  // Initialize chat
  useEffect(() => {
    const initChat = async () => {
      if (!user?.id || !channelName || isInitializedRef.current) return;

      setIsLoading(true);
      setError(null);
      
      // Check for cached messages first
      const cached = messageCache.get(channelName);
      if (cached?.length > 0) {
        console.log('📦 Using cached messages:', cached.length);
        setMessages(cached);
      }

      try {
        const chId = await getOrCreateChannel(channelName);
        if (!chId) {
          setError('Failed to initialize channel');
          return;
        }

        setChannelId(chId);
        await loadMessages(chId);
        setupSubscription(chId);
        
        isInitializedRef.current = true;
        console.log('✅ Chat initialized for:', channelName);
        
      } catch (err) {
        console.error('❌ Init error:', err);
        setError('Failed to initialize chat');
      } finally {
        setIsLoading(false);
      }
    };

    // Reset initialization flag when channel changes
    isInitializedRef.current = false;
    initChat();
  }, [channelName, user?.id, getOrCreateChannel, loadMessages, setupSubscription]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleanup subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  if (!user?.id) return null;

  return {
    messages,
    isLoading,
    error,
    isConnected,
    sendMessage,
    deleteMessage,
    channelId
  };
}