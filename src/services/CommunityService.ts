
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
  created_at: string;
  workspace_id?: string;
}

export class CommunityService {
  static channels: Channel[] = [
    { id: 'general', name: 'general', icon: 'hash' },
    { id: 'hall-of-fame', name: 'hall-of-fame', icon: 'trophy' },
    { id: 'daily-talks', name: 'daily-talks', icon: 'message-square' },
    { id: 'global-connect', name: 'global-connect', icon: 'globe' }
  ];
  
  static async getChannelWorkspace(channelName: string, userId: string): Promise<string> {
    try {
      // Check if workspace exists
      const { data: workspace, error } = await supabase
        .from('workspaces')
        .select('id')
        .eq('name', channelName)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No data found
          // Create workspace
          const { data: newWorkspace, error: createError } = await supabase
            .from('workspaces')
            .insert({ 
              name: channelName, 
              owner_id: userId,
              description: `Channel for ${channelName} discussions`
            })
            .select()
            .single();
            
          if (createError) throw createError;
          
          // Add current user as member
          await supabase
            .from('workspace_members')
            .insert({ 
              workspace_id: newWorkspace.id, 
              user_id: userId, 
              role: 'owner' 
            });
            
          return newWorkspace.id;
        }
        throw error;
      }
      
      return workspace.id;
    } catch (error) {
      console.error('Error getting channel workspace:', error);
      toast.error('Error accessing channel workspace');
      throw error;
    }
  }
  
  static async getMessages(channelName: string, userId: string): Promise<Message[]> {
    try {
      const workspaceId = await this.getChannelWorkspace(channelName, userId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at, workspace_id,
          sender_id, profiles:profiles(username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Format the messages to match our Message interface
      const formattedMessages: Message[] = data?.map(message => {
        // Extract profiles data safely
        const profileData = message.profiles && Array.isArray(message.profiles) && message.profiles.length > 0
          ? message.profiles[0]
          : null;
        
        return {
          id: message.id,
          content: message.content,
          sender_id: message.sender_id || '',
          created_at: message.created_at,
          workspace_id: message.workspace_id || '',
          sender: profileData ? {
            username: profileData.username,
            avatar_url: profileData.avatar_url,
            full_name: profileData.full_name
          } : undefined
        };
      }) || [];
      
      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error loading messages');
      throw error;
    }
  }
  
  static async sendMessage(channelName: string, content: string, userId: string): Promise<Message> {
    try {
      const workspaceId = await this.getChannelWorkspace(channelName, userId);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: userId,
          workspace_id: workspaceId
        })
        .select(`
          id, content, created_at, workspace_id,
          sender_id, profiles:profiles(username, avatar_url, full_name)
        `)
        .single();
        
      if (error) throw error;
      
      // Format the message to match our Message interface
      const profileData = data.profiles && Array.isArray(data.profiles) && data.profiles.length > 0
        ? data.profiles[0]
        : null;
      
      const formattedMessage: Message = {
        id: data.id,
        content: data.content,
        sender_id: data.sender_id || '',
        created_at: data.created_at,
        workspace_id: data.workspace_id || '',
        sender: profileData ? {
          username: profileData.username,
          avatar_url: profileData.avatar_url,
          full_name: profileData.full_name
        } : undefined
      };
      
      return formattedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }
  
  static async subscribeToMessages(channelName: string, userId: string, callback: (message: Message) => void): Promise<() => void> {
    try {
      // First get the workspace ID for this channel
      const workspaceId = await this.getChannelWorkspace(channelName, userId);
      
      // Create a channel for realtime updates
      const realtimeChannel = supabase
        .channel(`messages:${workspaceId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `workspace_id=eq.${workspaceId}`
          },
          async (payload) => {
            // When a new message is inserted
            const messageData = payload.new as any;
            
            try {
              // Get the sender information from profiles
              if (messageData.sender_id) {
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('username, avatar_url, full_name')
                  .eq('id', messageData.sender_id)
                  .single();
                
                // Call the callback with the formatted message
                callback({
                  id: messageData.id,
                  content: messageData.content,
                  sender_id: messageData.sender_id || '',
                  created_at: messageData.created_at,
                  workspace_id: messageData.workspace_id || '',
                  sender: senderData || undefined
                });
              }
            } catch (error) {
              console.error('Error processing realtime message:', error);
            }
          }
        )
        .subscribe();
      
      // Return unsubscribe function
      return () => {
        supabase.removeChannel(realtimeChannel);
      };
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      toast.error('Error connecting to chat service');
      // Return a no-op function in case of error
      return () => {};
    }
  }
  
  static async getSenderInfo(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url, full_name')
      .eq('id', userId)
      .single();
      
    return data;
  }
  
  static async joinChannel(channelName: string, userId: string): Promise<void> {
    try {
      const workspaceId = await this.getChannelWorkspace(channelName, userId);
      
      // Check if user is already a member
      const { data: membership, error: membershipError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle to avoid error when no record is found
      
      // If not a member, add them
      if (!membership) {
        await supabase
          .from('workspace_members')
          .insert({ 
            workspace_id: workspaceId, 
            user_id: userId, 
            role: 'member' 
          });
          
        toast.success(`You've joined #${channelName}`);
      }
    } catch (error) {
      console.error('Error joining channel:', error);
      toast.error('Failed to join channel');
    }
  }

  // Add method to enable realtime for messages table
  static async enableRealtimeForMessages(): Promise<void> {
    try {
      // This should be run once when the app initializes
      const { data, error } = await supabase
        .rpc('enable_realtime_for_messages');
        
      if (error) {
        console.error('Error enabling realtime for messages:', error);
      } else {
        console.log('Realtime enabled for messages');
      }
    } catch (error) {
      console.error('Error calling enable_realtime_for_messages:', error);
    }
  }

  // Get online users in a channel
  static async getChannelOnlineUsers(channelName: string): Promise<any[]> {
    try {
      // If userId is empty, just return empty array to avoid errors
      if (!channelName) return [];
      
      const workspaceId = await this.getChannelWorkspace(channelName, '');
      
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          user_id,
          profiles:profiles(username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId);
        
      if (error) throw error;
      
      // For now, we're just returning all members as we don't have a presence system yet
      return data || [];
    } catch (error) {
      console.error('Error fetching online users:', error);
      return [];
    }
  }
}

export default CommunityService;
