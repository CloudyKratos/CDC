import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface PersistentChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  channelId: string | null;
}

// Global persistent cache using both memory and localStorage
class MessageCache {
  private memoryCache = new Map<string, Message[]>();
  
  get(channelName: string): Message[] {
    // Try memory first
    const memory = this.memoryCache.get(channelName);
    if (memory) return memory;
    
    // Try localStorage
    try {
      const stored = localStorage.getItem(`chat-${channelName}`);
      if (stored) {
        const parsed = JSON.parse(stored) as Message[];
        this.memoryCache.set(channelName, parsed);
        return parsed;
      }
    } catch (err) {
      console.warn('Failed to read from localStorage:', err);
    }
    
    return [];
  }
  
  set(channelName: string, messages: Message[]) {
    // Update memory
    this.memoryCache.set(channelName, messages);
    
    // Update localStorage
    try {
      localStorage.setItem(`chat-${channelName}`, JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to write to localStorage:', err);
    }
  }
  
  update(channelName: string, updater: (prev: Message[]) => Message[]) {
    const current = this.get(channelName);
    const updated = updater(current);
    this.set(channelName, updated);
    return updated;
  }
}

const messageCache = new MessageCache();

// Global channel cache to prevent re-creation
const channelCache = new Map<string, string>();

// Global subscription manager
const subscriptions = new Map<string, any>();

export function usePersistentChat(channelName: string): PersistentChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => messageCache.get(channelName));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);

  const initPromiseRef = useRef<Promise<void> | null>(null);

  console.log('💬 usePersistentChat:', channelName, 'cached messages:', messages.length);

  // Get or create channel with caching
  const getChannelId = useCallback(async (name: string): Promise<string | null> => {
    if (!user?.id) return null;

    // Check cache first
    const cached = channelCache.get(name);
    if (cached) {
      console.log('📋 Using cached channel ID:', cached);
      return cached;
    }

    try {
      // Find existing channel
      const { data: existingChannel } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .single();

      if (existingChannel) {
        channelCache.set(name, existingChannel.id);
        return existingChannel.id;
      }

      // Create new channel
      const { data: newChannel, error } = await supabase
        .from('channels')
        .insert({
          name,
          type: 'public',
          description: `${name} discussion`,
          created_by: user.id
        })
        .select('id')
        .single();

      if (error) {
        if (error.code === '23505') {
          // Handle race condition
          const { data: raceChannel } = await supabase
            .from('channels')
            .select('id')
            .eq('name', name)
            .single();
          if (raceChannel) {
            channelCache.set(name, raceChannel.id);
            return raceChannel.id;
          }
        }
        throw error;
      }

      if (newChannel) {
        channelCache.set(name, newChannel.id);
        return newChannel.id;
      }

      return null;
    } catch (err) {
      console.error('❌ Channel error:', err);
      return null;
    }
  }, [user?.id]);

  // Load fresh messages
  const loadMessages = useCallback(async (chId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select(`
          id, content, created_at, sender_id, is_deleted, edited, edited_at,
          profiles!community_messages_sender_id_fkey(id, username, full_name, avatar_url)
        `)
        .eq('channel_id', chId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        is_deleted: false,
        edited: msg.edited || false,
        edited_at: msg.edited_at,
        reactions: [],
        sender: msg.profiles ? {
          id: msg.profiles.id,
          username: msg.profiles.username || 'User',
          full_name: msg.profiles.full_name || 'Member',
          avatar_url: msg.profiles.avatar_url
        } : {
          id: msg.sender_id,
          username: 'User',
          full_name: 'Member',
          avatar_url: null
        }
      }));

      // Update both state and cache
      setMessages(formattedMessages);
      messageCache.set(channelName, formattedMessages);
      
      console.log('✅ Loaded fresh messages:', formattedMessages.length);
      
    } catch (err) {
      console.error('❌ Load error:', err);
      setError('Failed to load messages');
    }
  }, [channelName]);

  // Setup subscription
  const setupSubscription = useCallback((chId: string) => {
    // Clean existing subscription
    const existing = subscriptions.get(chId);
    if (existing) {
      existing.unsubscribe();
      subscriptions.delete(chId);
    }

    console.log('📡 Setting up subscription for:', chId);
    
    const subscription = supabase
      .channel(`messages-${chId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `channel_id=eq.${chId}`
      }, async (payload) => {
        const newMsg = payload.new as any;
        console.log('📨 Realtime message:', newMsg.id);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', newMsg.sender_id)
          .single();

        const message: Message = {
          id: newMsg.id,
          content: newMsg.content,
          created_at: newMsg.created_at,
          sender_id: newMsg.sender_id,
          is_deleted: false,
          edited: false,
          edited_at: null,
          reactions: [],
          sender: profile || {
            id: newMsg.sender_id,
            username: 'User',
            full_name: 'Member',
            avatar_url: null
          }
        };

        // Update cache and state
        const updatedMessages = messageCache.update(channelName, prev => {
          const exists = prev.find(m => m.id === message.id);
          return exists ? prev : [...prev, message];
        });
        
        setMessages(updatedMessages);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'community_messages',
        filter: `channel_id=eq.${chId}`
      }, (payload) => {
        const updatedMsg = payload.new as any;
        
        if (updatedMsg.is_deleted) {
          const updatedMessages = messageCache.update(channelName, prev => 
            prev.filter(m => m.id !== updatedMsg.id)
          );
          setMessages(updatedMessages);
        }
      })
      .subscribe((status) => {
        console.log('📡 Status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Connection failed');
        }
      });

    subscriptions.set(chId, subscription);
  }, [channelName]);

  // Send message
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!channelId || !content.trim()) return false;

    try {
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user!.id,
          content: content.trim()
        });

      if (error) throw error;
      return true;
    } catch (err) {
      toast.error('Failed to send message');
      return false;
    }
  }, [channelId, user]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Optimistic update
      const updatedMessages = messageCache.update(channelName, prev => 
        prev.filter(m => m.id !== messageId)
      );
      setMessages(updatedMessages);

      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user!.id);

      if (error) throw error;
      toast.success('Message deleted');
    } catch (err) {
      // Restore on error
      const restored = messageCache.get(channelName);
      setMessages(restored);
      toast.error('Failed to delete');
    }
  }, [channelName, user]);

  // Initialize chat
  useEffect(() => {
    if (!user?.id || !channelName) return;

    // Prevent multiple simultaneous initializations
    if (initPromiseRef.current) {
      return;
    }

    const initChat = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const chId = await getChannelId(channelName);
        if (!chId) {
          setError('Failed to get channel');
          return;
        }

        setChannelId(chId);
        
        // Load fresh messages
        await loadMessages(chId);
        
        // Setup realtime
        setupSubscription(chId);
        
      } catch (err) {
        console.error('❌ Init failed:', err);
        setError('Failed to initialize');
      } finally {
        setIsLoading(false);
        initPromiseRef.current = null;
      }
    };

    initPromiseRef.current = initChat();

    // Cleanup
    return () => {
      initPromiseRef.current = null;
    };
  }, [channelName, user?.id, getChannelId, loadMessages, setupSubscription]);

  // Update state when cache changes for this channel
  useEffect(() => {
    const cached = messageCache.get(channelName);
    setMessages(cached);
  }, [channelName]);

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