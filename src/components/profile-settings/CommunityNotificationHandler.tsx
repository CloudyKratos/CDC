
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { MessageSquare, Users, AtSign, Bell } from 'lucide-react';

export const CommunityNotificationHandler = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!user?.id) return;

    // Set up real-time listeners for community notifications
    const messageChannel = supabase
      .channel('community-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages'
        },
        (payload) => {
          const message = payload.new;
          
          // Don't notify about own messages
          if (message.sender_id === user.id) return;
          
          // Check if user should be notified about this message
          checkAndSendNotification(message);
        }
      )
      .subscribe();

    const memberChannel = supabase
      .channel('channel-members')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'channel_members'
        },
        (payload) => {
          const membership = payload.new;
          
          // Notify about new members joining channels user is in
          if (membership.user_id !== user.id) {
            handleNewMemberNotification(membership);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(memberChannel);
    };
  }, [user?.id, addNotification]);

  const checkAndSendNotification = async (message: any) => {
    if (!user?.id) return;

    try {
      // Check if user is a member of the channel
      const { data: membership } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', message.channel_id)
        .eq('user_id', user.id)
        .single();

      if (!membership) return;

      // Check if user has community notifications enabled
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const pushEnabled = settings?.push_notifications !== false;
      
      if (!pushEnabled) return;

      // Get channel info
      const { data: channel } = await supabase
        .from('channels')
        .select('name')
        .eq('id', message.channel_id)
        .single();

      // Check if message mentions the user
      const isMention = message.content?.includes(`@${user.name}`) || 
                       message.content?.includes(`@${user.email}`);

      if (isMention) {
        addNotification({
          title: "You were mentioned",
          description: `Someone mentioned you in #${channel?.name || 'channel'}`,
          time: "Just now",
          read: false,
          type: 'message',
          icon: <AtSign className="h-4 w-4" />
        });
      } else {
        // Regular channel message notification
        addNotification({
          title: `New message in #${channel?.name || 'channel'}`,
          description: message.content?.substring(0, 100) + (message.content?.length > 100 ? '...' : ''),
          time: "Just now",
          read: false,
          type: 'message',
          icon: <MessageSquare className="h-4 w-4" />
        });
      }
    } catch (error) {
      console.error('Error processing community notification:', error);
    }
  };

  const handleNewMemberNotification = async (membership: any) => {
    if (!user?.id) return;

    try {
      // Check if user is also in this channel
      const { data: userMembership } = await supabase
        .from('channel_members')
        .select('*')
        .eq('channel_id', membership.channel_id)
        .eq('user_id', user.id)
        .single();

      if (!userMembership) return;

      // Check notification settings
      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings?.push_notifications === false) return;

      // Get channel and new member info
      const { data: channel } = await supabase
        .from('channels')
        .select('name')
        .eq('id', membership.channel_id)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', membership.user_id)
        .single();

      addNotification({
        title: "New member joined",
        description: `${profile?.full_name || 'Someone'} joined #${channel?.name || 'channel'}`,
        time: "Just now",
        read: false,
        type: 'user',
        icon: <Users className="h-4 w-4" />
      });
    } catch (error) {
      console.error('Error processing new member notification:', error);
    }
  };

  // This component doesn't render anything, it just handles notifications
  return null;
};
