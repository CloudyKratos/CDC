
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
      throw error;
    }
  }
  
  static async getMessages(channelName: string, userId: string): Promise<Message[]> {
    try {
      const workspaceId = await this.getChannelWorkspace(channelName, userId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id, content, created_at,
          sender_id, profiles:sender_id (username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
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
          id, content, created_at,
          sender_id, profiles:sender_id (username, avatar_url, full_name)
        `)
        .single();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  static async subscribeToMessages(channelName: string, callback: (message: Message) => void) {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          // Check if the message is for the current channel (workspace)
          const message = payload.new as Message & { workspace_id: string };
          
          // Get the sender information
          this.getSenderInfo(message.sender_id).then(sender => {
            callback({
              ...message,
              sender
            });
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
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
        .single();
      
      // If not a member, add them
      if (membershipError && membershipError.code === 'PGRST116') {
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
}

export default CommunityService;
