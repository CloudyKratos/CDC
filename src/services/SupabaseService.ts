import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/workspace';
import { toast } from 'sonner';

// Types for Supabase tables
export interface WorkspaceData {
  id?: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: Date | string;
  end_time: Date | string;
  created_by?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MessageData {
  id?: string;
  content: string;
  sender_id: string;
  workspace_id: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  sender?: {
    username?: string;
    avatar_url?: string;
    full_name?: string;
  };
}

export interface ProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMemberData {
  workspace_id: string;
  user_id: string;
  joined_at?: string;
  role: string;
  profile?: ProfileData;
}

// Utility functions for common operations
export class SupabaseService {
  // Workspaces
  static async getWorkspaces(userId: string): Promise<WorkspaceData[]> {
    try {
      // Get workspaces where user is owner OR member
      const { data: ownedWorkspaces, error: ownedError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', userId);
        
      if (ownedError) throw ownedError;
      
      const { data: memberWorkspaces, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId);
        
      if (memberError) throw memberError;
      
      // If user is member of any workspaces, get those details too
      let memberWorkspacesDetails: WorkspaceData[] = [];
      
      if (memberWorkspaces && memberWorkspaces.length > 0) {
        const workspaceIds = memberWorkspaces.map(w => w.workspace_id);
        
        const { data, error } = await supabase
          .from('workspaces')
          .select('*')
          .in('id', workspaceIds);
          
        if (error) throw error;
        
        memberWorkspacesDetails = data || [];
      }
      
      // Combine owned and member workspaces, removing duplicates
      const allWorkspaces = [...(ownedWorkspaces || []), ...memberWorkspacesDetails];
      const uniqueWorkspaces = Array.from(
        new Map(allWorkspaces.map(item => [item.id, item])).values()
      );
      
      return uniqueWorkspaces;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      toast.error('Failed to load workspaces');
      throw error;
    }
  }
  
  static async createWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert(workspace)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as member
      await this.addWorkspaceMember({
        workspace_id: data.id as string,
        user_id: workspace.owner_id,
        role: 'owner'
      });
      
      return data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      toast.error('Failed to create workspace');
      throw error;
    }
  }
  
  // Events
  static async getEvents(filter: { workspace_id?: string; start_date?: string; end_date?: string } = {}): Promise<EventData[]> {
    try {
      let query = supabase.from('events').select('*');
      
      if (filter.workspace_id) {
        query = query.eq('workspace_id', filter.workspace_id);
      }
      
      if (filter.start_date) {
        query = query.gte('start_time', filter.start_date);
      }
      
      if (filter.end_date) {
        query = query.lte('end_time', filter.end_date);
      }
      
      const { data, error } = await query.order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
      throw error;
    }
  }
  
  static async createEvent(event: EventData): Promise<EventData> {
    try {
      // Format dates if needed
      const formattedEvent = {
        ...event,
        start_time: event.start_time instanceof Date ? event.start_time.toISOString() : event.start_time,
        end_time: event.end_time instanceof Date ? event.end_time.toISOString() : event.end_time
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(formattedEvent)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
      throw error;
    }
  }
  
  static async updateEvent(id: string, event: Partial<EventData>): Promise<EventData> {
    try {
      // Format dates if needed
      const formattedEvent = {
        ...event,
        start_time: event.start_time instanceof Date ? event.start_time.toISOString() : event.start_time,
        end_time: event.end_time instanceof Date ? event.end_time.toISOString() : event.end_time
      };
      
      const { data, error } = await supabase
        .from('events')
        .update(formattedEvent)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      throw error;
    }
  }
  
  static async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      throw error;
    }
  }
  
  // Messages
  static async getMessages(workspaceId: string): Promise<MessageData[]> {
    try {
      // Join with profiles table instead of trying to use the sender relation
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id(username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Format messages with sender info
      const formattedMessages: MessageData[] = (data || []).map(message => {
        // Handle case where profiles might not be available
        const profileInfo = message.profiles as { username?: string; avatar_url?: string; full_name?: string; } || {};
        
        return {
          ...message,
          sender: {
            username: profileInfo.username || '',
            avatar_url: profileInfo.avatar_url || '',
            full_name: profileInfo.full_name || ''
          }
        };
      });
      
      return formattedMessages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      throw error;
    }
  }
  
  static async sendMessage(message: MessageData): Promise<MessageData> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select(`
          *,
          profiles:sender_id(username, avatar_url, full_name)
        `)
        .single();
        
      if (error) throw error;
      
      // Format message with sender info
      const profileInfo = data.profiles as { username?: string; avatar_url?: string; full_name?: string; } || {};
      
      return {
        ...data,
        sender: {
          username: profileInfo.username || '',
          avatar_url: profileInfo.avatar_url || '',
          full_name: profileInfo.full_name || ''
        }
      };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      throw error;
    }
  }
  
  static subscribeToMessages(workspaceId: string, callback: (message: MessageData) => void): () => void {
    const channel = supabase
      .channel(`messages:${workspaceId}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${workspaceId}`
        },
        async (payload) => {
          try {
            // Get the sender information
            const message = payload.new as MessageData;
            const { data: senderInfo } = await supabase
              .from('profiles')
              .select('username, avatar_url, full_name')
              .eq('id', message.sender_id)
              .single();
              
            callback({
              ...message,
              sender: senderInfo || {}
            });
          } catch (error) {
            console.error('Error in message subscription:', error);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
  
  // Profiles
  static async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();  // Use maybeSingle to avoid error when no profile is found
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
  
  static async updateProfile(profile: Partial<ProfileData> & { id: string }): Promise<ProfileData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  }
  
  // Workspace Members
  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberData[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          member_profile:profiles(id, username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId);
        
      if (error) throw error;
      
      // Format the data to match our interface
      const formattedMembers: WorkspaceMemberData[] = (data || []).map(member => {
        // member_profile will be an object or null
        const profileData = member.member_profile as ProfileData | null;
        
        return {
          workspace_id: member.workspace_id,
          user_id: member.user_id,
          joined_at: member.joined_at,
          role: member.role,
          profile: profileData ? {
            id: profileData.id,
            username: profileData.username || '',
            avatar_url: profileData.avatar_url || '',
            full_name: profileData.full_name || '',
            bio: profileData.bio || '',
            location: profileData.location || '',
            website: profileData.website || ''
          } : undefined
        };
      });
      
      return formattedMembers;
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      toast.error('Failed to load workspace members');
      throw error;
    }
  }
  
  static async addWorkspaceMember(member: WorkspaceMemberData): Promise<WorkspaceMemberData> {
    try {
      // Check if member already exists
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', member.workspace_id)
        .eq('user_id', member.user_id)
        .maybeSingle();
        
      if (existingMember) {
        return existingMember;
      }
      
      // Add new member
      const { data, error } = await supabase
        .from('workspace_members')
        .insert(member)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      toast.error('Failed to add workspace member');
      throw error;
    }
  }
  
  // Authentication helpers
  static async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Account created successfully!', {
          description: 'Check your email to verify your account.'
        });
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: fullName,
          role: 'user',
          permissions: ['read', 'comment'],
          lastLogin: new Date().toISOString(),
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error('Failed to create account', {
        description: error.message
      });
      return null;
    }
  }
  
  static async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get profile data
        const profile = await this.getProfile(data.user.id);
        
        toast.success('Signed in successfully!');
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.full_name || data.user.user_metadata.full_name || email.split('@')[0],
          role: data.user.user_metadata.role || 'user',
          avatar: profile?.avatar_url || data.user.user_metadata.avatar_url,
          permissions: ['read', 'comment'],
          lastLogin: new Date().toISOString(),
          profile: profile ? {
            bio: profile.bio || '',
            location: profile.location || '',
            timeZone: 'UTC',
            website: profile.website || ''
          } : undefined
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in', {
        description: error.message
      });
      return null;
    }
  }

  // Password reset functionality
  static async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) throw error;
      
      toast.success('Password reset email sent', {
        description: 'Please check your email for instructions'
      });
      
      return true;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error('Failed to send reset email', {
        description: error.message
      });
      return false;
    }
  }
  
  // Update password with a new one
  static async updatePassword(newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast.success('Password updated successfully');
      return true;
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password', {
        description: error.message
      });
      return false;
    }
  }

  // Setup realtime for messages
  static async enableRealtimeForMessages(): Promise<void> {
    try {
      await supabase.rpc('enable_realtime', {
        table_name: 'messages'
      });
    } catch (error) {
      console.error('Error enabling realtime for messages:', error);
    }
  }

  // Enable presence for tracking online users
  static setupPresence(userId: string, channelName: string, userInfo: any): { subscribe: () => void, unsubscribe: () => void } {
    const channel = supabase.channel(`presence:${channelName}`);
    
    const subscribe = () => {
      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          console.log('Presence state sync:', state);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User(s) joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User(s) left:', key, leftPresences);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: userId,
              ...userInfo,
              online_at: new Date().toISOString()
            });
          }
        });
    };
    
    const unsubscribe = () => {
      supabase.removeChannel(channel);
    };
    
    return { subscribe, unsubscribe };
  }
}

export default SupabaseService;
