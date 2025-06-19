
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  channelId: string | null;
  error: string | null;
}

export class ChatManager {
  private static instance: ChatManager;
  private subscriptions = new Map<string, any>();
  private channels = new Map<string, string>(); // channelName -> channelId
  private listeners = new Set<(state: ChatState) => void>();
  
  private state: ChatState = {
    messages: [],
    isLoading: false,
    isConnected: false,
    channelId: null,
    error: null
  };

  static getInstance(): ChatManager {
    if (!ChatManager.instance) {
      ChatManager.instance = new ChatManager();
    }
    return ChatManager.instance;
  }

  subscribe(listener: (state: ChatState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(updates: Partial<ChatState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  async initializeChannel(channelName: string, userId: string): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      console.log('🔄 ChatManager: Initializing channel:', channelName);

      // Get or create channel
      const channelId = await this.getOrCreateChannel(channelName, userId);
      this.channels.set(channelName, channelId);
      
      // Auto-join user to channel
      await this.ensureUserInChannel(channelId, userId);
      
      // Load existing messages
      const messages = await this.loadMessages(channelId);
      
      // Set up real-time subscription
      this.setupRealtimeSubscription(channelId);
      
      this.setState({
        channelId,
        messages,
        isLoading: false,
        isConnected: true
      });

      console.log('✅ ChatManager: Channel initialized successfully');
    } catch (error) {
      console.error('💥 ChatManager: Failed to initialize channel:', error);
      this.setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize chat'
      });
    }
  }

  private async getOrCreateChannel(channelName: string, userId: string): Promise<string> {
    try {
      // First try to get existing channel
      let { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Failed to check channel: ${error.message}`);
      }

      if (!channel) {
        // Create new channel
        console.log('📝 ChatManager: Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
            created_by: userId
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      }

      return channel.id;
    } catch (error) {
      console.error('💥 ChatManager: Error in getOrCreateChannel:', error);
      throw error;
    }
  }

  private async ensureUserInChannel(channelId: string, userId: string): Promise<void> {
    try {
      console.log('👥 ChatManager: Ensuring user is in channel');
      
      // Insert membership (will be ignored if already exists due to UNIQUE constraint)
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: userId
        });

      // Ignore unique constraint violations (user already in channel)
      if (error && !error.message.includes('duplicate key') && !error.message.includes('unique')) {
        console.warn('⚠️ ChatManager: Could not add user to channel:', error);
      }
    } catch (error) {
      console.warn('⚠️ ChatManager: Error ensuring user in channel:', error);
      // Don't throw - this shouldn't block chat functionality
    }
  }

  private async loadMessages(channelId: string): Promise<Message[]> {
    console.log('📥 ChatManager: Loading messages for channel:', channelId);
    
    try {
      const { data: messages, error } = await supabase
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
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ ChatManager: Error loading messages:', error);
        // Return empty array instead of throwing
        return [];
      }

      if (!messages) return [];

      return messages.map(msg => ({
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
    } catch (error) {
      console.error('💥 ChatManager: Exception loading messages:', error);
      return [];
    }
  }

  private setupRealtimeSubscription(channelId: string): void {
    // Clean up existing subscription
    if (this.subscriptions.has(channelId)) {
      supabase.removeChannel(this.subscriptions.get(channelId));
    }

    console.log('📡 ChatManager: Setting up real-time subscription');
    
    const subscription = supabase
      .channel(`community_messages_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          console.log('📨 ChatManager: New message received:', payload);
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

          // Add message to state if it doesn't already exist
          this.setState({
            messages: [...this.state.messages.filter(m => m.id !== message.id), message]
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
            this.setState({
              messages: this.state.messages.filter(msg => msg.id !== updatedMessage.id)
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 ChatManager: Subscription status:', status);
        this.setState({ isConnected: status === 'SUBSCRIBED' });
      });

    this.subscriptions.set(channelId, subscription);
  }

  async sendMessage(content: string, userId: string): Promise<void> {
    if (!this.state.channelId) {
      throw new Error('No channel selected');
    }

    if (!content.trim()) {
      toast.error('Cannot send empty message');
      return;
    }

    try {
      console.log('📤 ChatManager: Sending message');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: this.state.channelId,
          sender_id: userId,
          content: content.trim()
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ ChatManager: Message sent successfully');
      toast.success('Message sent!', { duration: 1000 });
    } catch (error) {
      console.error('💥 ChatManager: Failed to send message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      console.log('🗑️ ChatManager: Deleting message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ ChatManager: Message deleted successfully');
      toast.success('Message deleted', { duration: 1000 });
    } catch (error) {
      console.error('💥 ChatManager: Failed to delete message:', error);
      toast.error('Failed to delete message');
      throw error;
    }
  }

  cleanup(channelId?: string): void {
    if (channelId && this.subscriptions.has(channelId)) {
      console.log('🧹 ChatManager: Cleaning up subscription for:', channelId);
      supabase.removeChannel(this.subscriptions.get(channelId));
      this.subscriptions.delete(channelId);
    } else {
      // Clean up all subscriptions
      console.log('🧹 ChatManager: Cleaning up all subscriptions');
      this.subscriptions.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
      this.subscriptions.clear();
    }
    
    this.setState({
      messages: [],
      isConnected: false,
      channelId: null,
      error: null
    });
  }
}
