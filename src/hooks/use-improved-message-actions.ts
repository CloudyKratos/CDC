import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Message, Reaction } from '@/types/chat';

export function useImprovedMessageActions() {
  const { user } = useAuth();

  // Enhanced delete message with proper error handling
  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to delete messages');
      return;
    }

    try {
      console.log('🗑️ Deleting message:', messageId);

      const { error } = await supabase
        .from('community_messages')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Ensure user can only delete their own messages

      if (error) {
        console.error('❌ Delete message error:', error);
        toast.error('Failed to delete message');
        return;
      }

      console.log('✅ Message deleted successfully');
      toast.success('Message deleted');
    } catch (error) {
      console.error('❌ Delete message error:', error);
      toast.error('Failed to delete message');
    }
  }, [user?.id]);

  // Enhanced edit message with optimistic updates
  const editMessage = useCallback(async (messageId: string, newContent: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please sign in to edit messages');
      return false;
    }

    if (!newContent.trim()) {
      toast.error('Message cannot be empty');
      return false;
    }

    try {
      console.log('✏️ Editing message:', messageId, 'New content:', newContent);

      const { data, error } = await supabase
        .from('community_messages')
        .update({ 
          content: newContent.trim(),
          edited: true,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Ensure user can only edit their own messages
        .select()
        .single();

      if (error) {
        console.error('❌ Edit message error:', error);
        toast.error('Failed to edit message');
        return false;
      }

      console.log('✅ Message edited successfully:', data);
      toast.success('Message edited');
      return true;
    } catch (error) {
      console.error('❌ Edit message error:', error);
      toast.error('Failed to edit message');
      return false;
    }
  }, [user?.id]);

  // Enhanced add reaction with toggle functionality
  const addReaction = useCallback(async (messageId: string, emoji: string): Promise<void> => {
    if (!user?.id) {
      toast.error('Please sign in to add reactions');
      return;
    }

    try {
      console.log('😀 Adding reaction:', emoji, 'to message:', messageId);

      // Check if user already reacted with this emoji
      const { data: existingReaction } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

      if (existingReaction) {
        // Remove existing reaction (toggle off)
        const { error: deleteError } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('❌ Remove reaction error:', deleteError);
          toast.error('Failed to remove reaction');
          return;
        }

        console.log('✅ Reaction removed successfully');
      } else {
        // Add new reaction
        const { error: insertError } = await supabase
          .from('message_reactions')
          .insert({
            message_id: messageId,
            user_id: user.id,
            emoji: emoji
          });

        if (insertError) {
          console.error('❌ Add reaction error:', insertError);
          toast.error('Failed to add reaction');
          return;
        }

        console.log('✅ Reaction added successfully');
      }
    } catch (error) {
      console.error('❌ Reaction error:', error);
      toast.error('Failed to update reaction');
    }
  }, [user?.id]);

  // Reply to message (sends a new message with parent reference)
  const replyToMessage = useCallback(async (
    parentMessageId: string, 
    content: string, 
    channelId: string
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Please sign in to reply');
      return false;
    }

    if (!content.trim()) {
      toast.error('Reply cannot be empty');
      return false;
    }

    try {
      console.log('💬 Replying to message:', parentMessageId, 'Content:', content);

      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim(),
          parent_message_id: parentMessageId
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Reply error:', error);
        toast.error('Failed to send reply');
        return false;
      }

      console.log('✅ Reply sent successfully:', data);
      toast.success('Reply sent');
      return true;
    } catch (error) {
      console.error('❌ Reply error:', error);
      toast.error('Failed to send reply');
      return false;
    }
  }, [user?.id]);

  // Fetch message reactions with enhanced data structure
  const fetchMessageReactions = useCallback(async (messageIds: string[]): Promise<Map<string, Reaction[]>> => {
    if (!messageIds.length) return new Map();

    try {
      const { data: reactions, error } = await supabase
        .from('message_reactions')
        .select(`
          message_id,
          emoji,
          user_id,
          profiles!message_reactions_user_id_fkey (
            id,
            username,
            full_name
          )
        `)
        .in('message_id', messageIds);

      if (error) {
        console.warn('⚠️ Could not fetch reactions:', error);
        return new Map();
      }

      // Group reactions by message and emoji
      const reactionsMap = new Map<string, Reaction[]>();
      
      if (reactions) {
        const groupedByMessage: { [messageId: string]: { [emoji: string]: any[] } } = {};
        
        reactions.forEach(reaction => {
          if (!groupedByMessage[reaction.message_id]) {
            groupedByMessage[reaction.message_id] = {};
          }
          if (!groupedByMessage[reaction.message_id][reaction.emoji]) {
            groupedByMessage[reaction.message_id][reaction.emoji] = [];
          }
          groupedByMessage[reaction.message_id][reaction.emoji].push(reaction);
        });

        // Convert to the expected format
        Object.entries(groupedByMessage).forEach(([messageId, emojiGroups]) => {
          const messageReactions: Reaction[] = Object.entries(emojiGroups).map(([emoji, reactionList]) => ({
            emoji,
            count: reactionList.length,
            users: reactionList.map(r => r.user_id),
            hasReacted: reactionList.some(r => r.user_id === user?.id)
          }));
          reactionsMap.set(messageId, messageReactions);
        });
      }

      return reactionsMap;
    } catch (error) {
      console.warn('⚠️ Could not fetch reactions:', error);
      return new Map();
    }
  }, [user?.id]);

  return {
    deleteMessage,
    editMessage,
    addReaction,
    replyToMessage,
    fetchMessageReactions
  };
}