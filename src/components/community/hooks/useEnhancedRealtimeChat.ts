import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface EnhancedChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  onlineUsers: string[];
  typing: string[];
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<void>;
  startTyping: () => void;
  stopTyping: () => void;
}

// Connection manager for handling multiple channels
class ConnectionManager {
  private static instance: ConnectionManager;
  private connections = new Map<string, any>();
  private presenceData = new Map<string, Set<string>>();

  static getInstance() {
    if (!ConnectionManager.instance) {
      ConnectionManager.instance = new ConnectionManager();
    }
    return ConnectionManager.instance;
  }

  createConnection(channelId: string, userId: string) {
    if (this.connections.has(channelId)) {
      console.log('🔄 Reusing existing connection for:', channelId);
      return this.connections.get(channelId);
    }

    console.log('🆕 Creating new connection for channel:', channelId);
    const channel = supabase.channel(`enhanced_chat_${channelId}`, {
      config: {
        presence: {
          key: userId
        }
      }
    });

    this.connections.set(channelId, channel);
    this.presenceData.set(channelId, new Set());
    
    return channel;
  }

  removeConnection(channelId: string) {
    const connection = this.connections.get(channelId);
    if (connection) {
      console.log('🧹 Removing connection for channel:', channelId);
      supabase.removeChannel(connection);
      this.connections.delete(channelId);
      this.presenceData.delete(channelId);
    }
  }

  updatePresence(channelId: string, users: string[]) {
    this.presenceData.set(channelId, new Set(users));
  }

  getPresence(channelId: string): string[] {
    return Array.from(this.presenceData.get(channelId) || []);
  }
}

export function useEnhancedRealtimeChat(channelName: string): EnhancedChatState | null {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typing, setTyping] = useState<string[]>([]);
  const [channelId, setChannelId] = useState<string | null>(null);

  const connectionManager = ConnectionManager.getInstance();
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize channel and load messages
  const initializeChat = useCallback(async () => {
    if (!user?.id || !channelName) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get or create channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .maybeSingle();

      let targetChannelId = channel?.id;

      if (!targetChannelId) {
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({ name: channelName, description: `Chat channel for ${channelName}` })
          .select('id')
          .single();

        if (createError) throw createError;
        targetChannelId = newChannel.id;
      }

      setChannelId(targetChannelId);

      // Load recent messages
      await loadMessages(targetChannelId);

      // Setup real-time connection
      setupRealtimeConnection(targetChannelId);

    } catch (err) {
      console.error('❌ Failed to initialize chat:', err);
      setError('Failed to connect to chat');
      setIsLoading(false);
    }
  }, [user?.id, channelName]);

  // Load messages from database
  const loadMessages = async (channelId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles!sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages = (messagesData || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      setMessages(formattedMessages);
      setIsLoading(false);
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      setError('Failed to load messages');
      setIsLoading(false);
    }
  };

  // Setup enhanced real-time connection
  const setupRealtimeConnection = (channelId: string) => {
    if (channelRef.current) {
      connectionManager.removeConnection(channelId);
    }

    const channel = connectionManager.createConnection(channelId, user!.id);
    channelRef.current = channel;

    // Listen for new messages
    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'community_messages',
        filter: `channel_id=eq.${channelId}`
      },
      async (payload: any) => {
        const newMessage = payload.new;
        
        // Fetch sender profile
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('id', newMessage.sender_id)
          .maybeSingle();

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
    );

    // Listen for message updates/deletions
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'community_messages',
        filter: `channel_id=eq.${channelId}`
      },
      (payload: any) => {
        const updatedMessage = payload.new;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === updatedMessage.id 
              ? { ...msg, content: updatedMessage.content }
              : msg
          ).filter(msg => {
            // Filter out deleted messages  
            if (msg.id === updatedMessage.id && updatedMessage.is_deleted) {
              return false;
            }
            return true;
          })
        );
      }
    );

    // Handle presence tracking
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const users = Object.keys(state);
      setOnlineUsers(users.filter(userId => userId !== user!.id));
      connectionManager.updatePresence(channelId, users);
    });

    channel.on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
      console.log('👋 User joined:', key, newPresences);
    });

    channel.on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
      console.log('👋 User left:', key, leftPresences);
    });

    // Handle typing indicators
    channel.on('broadcast', { event: 'typing_start' }, ({ payload }: any) => {
      if (payload.user_id !== user!.id) {
        setTyping(prev => [...new Set([...prev, payload.user_id])]);
      }
    });

    channel.on('broadcast', { event: 'typing_stop' }, ({ payload }: any) => {
      if (payload.user_id !== user!.id) {
        setTyping(prev => prev.filter(id => id !== payload.user_id));
      }
    });

    // Subscribe to channel
    channel.subscribe(async (status: string) => {
      console.log('📡 Enhanced subscription status:', status);
      setIsConnected(status === 'SUBSCRIBED');
      
      if (status === 'SUBSCRIBED') {
        // Track presence
        await channel.track({
          user_id: user!.id,
          online_at: new Date().toISOString()
        });
      }
    });
  };

  // Send message with enhanced features
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user?.id || !channelId || !content.trim()) return false;

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('❌ Error sending message:', err);
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

      if (error) throw error;
      toast.success('Message deleted');
    } catch (err) {
      console.error('❌ Failed to delete message:', err);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Typing indicators
  const startTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_start',
        payload: { user_id: user!.id }
      });
    }
  }, [user?.id]);

  const stopTyping = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: { user_id: user!.id }
      });
    }
  }, [user?.id]);

  // Initialize chat when component mounts or channel changes
  useEffect(() => {
    initializeChat();

    return () => {
      if (channelId && channelRef.current) {
        connectionManager.removeConnection(channelId);
      }
    };
  }, [channelName, user?.id]);

  if (!user?.id) return null;

  return {
    messages,
    isLoading,
    error,
    isConnected,
    onlineUsers,
    typing,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping
  };
}