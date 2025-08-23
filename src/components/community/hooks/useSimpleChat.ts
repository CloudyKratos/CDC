
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';
import { useImprovedMessageActions } from '@/hooks/use-improved-message-actions';

interface SimpleChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  channelId: string | null;
}

// Global subscription manager to prevent duplicates
const activeSubscriptions = new Map<string, any>();

export function useSimpleChat(channelName: string): SimpleChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  const subscriptionRef = useRef<any>(null);
  const channelInitialized = useRef<string | null>(null);
  const { fetchMessageReactions } = useImprovedMessageActions();

  console.log('🎯 useSimpleChat hook called for channel:', channelName);

  // Initialize chat for a channel
  const initializeChat = useCallback(async (targetChannelName: string) => {
    if (!user?.id || !targetChannelName) {
      setIsLoading(false);
      return;
    }

    // Prevent duplicate initialization
    if (channelInitialized.current === targetChannelName) {
      console.log('⚠️ Channel already initialized:', targetChannelName);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('🚀 Initializing chat for channel:', targetChannelName);

      // Get or create channel
      const channelResult = await getOrCreateChannel(targetChannelName);
      if (!channelResult) {
        throw new Error('Failed to get or create channel');
      }

      setChannelId(channelResult);
      channelInitialized.current = targetChannelName;

      // Load messages
      await loadMessages(channelResult);

      // Setup realtime subscription
      setupRealtimeSubscription(channelResult);

      console.log('✅ Chat initialized successfully for channel:', targetChannelName);
      
    } catch (err) {
      console.error('❌ Failed to initialize chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize chat');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Get or create channel
  const getOrCreateChannel = async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting or creating channel:', name);
      
      // First try to find existing channel
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .limit(1)
        .single();

      if (!error && channel) {
        console.log('✅ Found existing channel:', channel.id);
        return channel.id;
      }

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Create new channel if not found
      console.log('📝 Creating new channel:', name);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: name,
          type: 'public',
          description: getChannelDescription(name),
          created_by: user.id
        })
        .select('id')
        .single();

      if (createError) {
        // Handle unique constraint violation
        if (createError.code === '23505') {
          console.log('🔄 Channel exists due to race condition, fetching...');
          const { data: existingChannel } = await supabase
            .from('channels')
            .select('id')
            .eq('name', name)
            .eq('type', 'public')
            .limit(1)
            .single();
          
          return existingChannel?.id || null;
        }
        throw createError;
      }

      console.log('✅ Created channel:', newChannel.id);
      return newChannel.id;
      
    } catch (err) {
      console.error('❌ Error in getOrCreateChannel:', err);
      return null;
    }
  };

  const getChannelDescription = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'general':
        return 'General discussion and community chat';
      case 'morning journey':
        return 'Start your day with motivation and morning routines';
      case 'announcement':
        return 'Important announcements and updates';
      default:
        return `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`;
    }
  };

  // Load messages with enhanced fields and reactions
  const loadMessages = async (channelId: string) => {
    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      // Fetch messages with additional fields
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select(`
          id, 
          content, 
          created_at,
          updated_at,
          sender_id,
          is_deleted,
          deleted_at,
          edited,
          edited_at,
          parent_message_id,
          thread_count
        `)
        .eq('channel_id', channelId)
        .is('parent_message_id', null) // Only get top-level messages, not replies
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      if (!messagesData || messagesData.length === 0) {
        setMessages([]);
        console.log('✅ No messages found for channel');
        return;
      }

      console.log(`📨 Found ${messagesData.length} messages, fetching sender profiles and reactions...`);

      // Get unique sender IDs
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      
      // Fetch profiles separately with error handling
      let profilesMap = new Map();
      try {
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', senderIds);

        if (profileError) {
          console.warn('⚠️ Could not fetch all profiles, using fallbacks:', profileError.message);
        }

        if (profiles) {
          profiles.forEach(profile => {
            profilesMap.set(profile.id, profile);
          });
        }
      } catch (profileErr) {
        console.warn('⚠️ Profile fetch failed completely, using fallbacks:', profileErr);
      }

      // Fetch reactions for all messages
      const messageIds = messagesData.map(msg => msg.id);
      const reactionsMap = await fetchMessageReactions(messageIds);

      // Format messages with available profiles and reactions
      const formattedMessages = messagesData.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        sender_id: msg.sender_id,
        is_deleted: msg.is_deleted,
        deleted_at: msg.deleted_at,
        edited: msg.edited,
        edited_at: msg.edited_at,
        parent_message_id: msg.parent_message_id,
        thread_count: msg.thread_count,
        reactions: reactionsMap.get(msg.id) || [],
        sender: profilesMap.get(msg.sender_id) || {
          id: msg.sender_id,
          username: 'User',
          full_name: 'Community Member',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      console.log('✅ Loaded messages with profiles and reactions:', formattedMessages.length);
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError(`Failed to load messages: ${err.message}`);
      setMessages([]);
    }
  };

// Setup enhanced realtime subscription with reconnection logic
  const setupRealtimeSubscription = (channelId: string) => {
    // Clean up existing subscription
    if (subscriptionRef.current) {
      console.log('🧹 Cleaning up existing subscription');
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    // Clean up global subscription if exists
    if (activeSubscriptions.has(channelId)) {
      console.log('🧹 Cleaning up global subscription for:', channelId);
      supabase.removeChannel(activeSubscriptions.get(channelId));
      activeSubscriptions.delete(channelId);
    }

    console.log('📡 Setting up enhanced realtime subscription for channel:', channelId);
    
    const subscription = supabase
      .channel(`community_messages_${channelId}`, {
        config: {
          presence: {
            key: user?.id || 'anonymous'
          }
        }
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        // Enhanced realtime subscription with reactions support
        async (payload) => {
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;
          
          // Get sender profile with cache optimization
          const { data: sender, error: senderError } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .maybeSingle();

          if (senderError) {
            console.warn('⚠️ Could not fetch sender profile:', senderError);
          }

          // Fetch reactions for the new message
          const reactionsMap = await fetchMessageReactions([newMessage.id]);

          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            updated_at: newMessage.updated_at,
            sender_id: newMessage.sender_id,
            is_deleted: newMessage.is_deleted,
            deleted_at: newMessage.deleted_at,
            edited: newMessage.edited,
            edited_at: newMessage.edited_at,
            parent_message_id: newMessage.parent_message_id,
            thread_count: newMessage.thread_count,
            reactions: reactionsMap.get(newMessage.id) || [],
            sender: sender || {
              id: newMessage.sender_id,
              username: 'Unknown User',
              full_name: 'Unknown User',
              avatar_url: null
            }
          };

          // Add the new message to state with proper deduplication
          setMessages(prev => {
            // Check for duplicates (both real ID and temp ID patterns)
            const exists = prev.some(msg => 
              msg.id === message.id || 
              (msg.sender_id === message.sender_id && 
               Math.abs(new Date(msg.created_at).getTime() - new Date(message.created_at).getTime()) < 5000)
            );
            
            if (exists) {
              console.log('⏭️ Message already exists or is duplicate, skipping:', message.id);
              return prev;
            }
            
            console.log('✅ Adding new message to state:', message.id);
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
        async (payload) => {
          console.log('🔄 Message updated:', payload);
          const updatedMessage = payload.new as any;
          
          setMessages(prev => prev.map(msg => {
            if (msg.id === updatedMessage.id) {
              return {
                ...msg,
                content: updatedMessage.content,
                edited: updatedMessage.edited,
                edited_at: updatedMessage.edited_at,
                is_deleted: updatedMessage.is_deleted,
                deleted_at: updatedMessage.deleted_at
              };
            }
            return msg;
          }).filter(msg => {
            // Filter out deleted messages
            if (msg.id === updatedMessage.id && updatedMessage.is_deleted) {
              return false;
            }
            return true;
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions',
          filter: `message_id=in.(${messages.map(m => m.id).join(',')})`
        },
        async (payload) => {
          console.log('😀 Reaction event:', payload);
          
          // Reload reactions for all messages when reactions change
          const messageIds = messages.map(m => m.id);
          if (messageIds.length > 0) {
            const reactionsMap = await fetchMessageReactions(messageIds);
            
            setMessages(prev => prev.map(msg => ({
              ...msg,
              reactions: reactionsMap.get(msg.id) || []
            })));
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status);
        if (err) {
          console.error('📡 Subscription error:', err);
          setError('Connection lost. Attempting to reconnect...');
          // Auto-reconnect after 3 seconds
          setTimeout(() => {
            if (channelId) setupRealtimeSubscription(channelId);
          }, 3000);
        } else {
          setIsConnected(status === 'SUBSCRIBED');
          if (status === 'SUBSCRIBED') {
            setError(null);
            console.log('🎉 Successfully connected to real-time channel');
          }
        }
      });

    subscriptionRef.current = subscription;
    activeSubscriptions.set(channelId, subscription);
  };

// Enhanced send message with optimistic updates
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) {
      console.error('❌ Cannot send message: missing user or channel');
      return false;
    }

    // Create optimistic message with complete structure
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`, // Temporary ID
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sender_id: user.id,
      is_deleted: false,
      deleted_at: null,
      edited: false,
      edited_at: null,
      parent_message_id: null,
      thread_count: 0,
      reactions: [],
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: 'You',
        avatar_url: null
      }
    };

    // Add optimistic message to state immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsLoading(true);
      console.log('📤 Sending message:', content);
      
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) {
        console.error('💥 Error sending message:', error);
        // Remove optimistic message on error
        setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
        toast.error('Failed to send message');
        return false;
      }

      console.log('✅ Message sent successfully:', data);
      
      // Replace optimistic message with real message data
      setMessages(prev => 
        prev.map(msg => 
          msg.id === optimisticMessage.id 
            ? { 
                ...optimisticMessage, 
                id: data.id, 
                created_at: data.created_at,
                updated_at: data.updated_at || data.created_at,
                // Preserve all other fields from optimistic message
                is_deleted: data.is_deleted || false,
                deleted_at: data.deleted_at,
                edited: data.edited || false,
                edited_at: data.edited_at,
                parent_message_id: data.parent_message_id,
                thread_count: data.thread_count || 0
              }
            : msg
        )
      );
      
      return true;
    } catch (err) {
      console.error('❌ Error sending message:', err);
      toast.error('Failed to send message');
      return false;
    } finally {
      setIsLoading(false);
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

      if (error) throw error;
      toast.success('Message deleted');
      
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Initialize when channel changes
  useEffect(() => {
    if (channelName && channelName !== channelInitialized.current) {
      // Reset state when switching channels
      setMessages([]);
      setError(null);
      setIsConnected(false);
      channelInitialized.current = null;
      
      initializeChat(channelName);
    }
  }, [channelName, initializeChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        console.log('🧹 Cleaning up subscription on unmount');
        supabase.removeChannel(subscriptionRef.current);
      }
      if (channelId && activeSubscriptions.has(channelId)) {
        supabase.removeChannel(activeSubscriptions.get(channelId));
        activeSubscriptions.delete(channelId);
      }
    };
  }, [channelId]);

  if (!user?.id) {
    return null;
  }

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
